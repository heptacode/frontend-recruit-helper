import {
  createGitHubRepo,
  addGitHubCollaborator,
  getCalendlyEvent,
  createClickUpTask,
} from './api.mjs';

export const typeformHandler = async event => {
  console.log('[Typeform Handler]');
  try {
    const payload = event.body ? JSON.parse(event.body) : null;

    if (!payload?.form_response.answers) {
      console.log('[BAD REQUEST] No payload.form_response.answers: ', { payload });
      return {
        statusCode: 400,
        body: JSON.stringify('Bad Request'),
      };
    }

    // Extract data from Typeform webhook payload
    const applicantName = payload.form_response.answers.find(
      answer => answer.field.ref === 'name'
    ).text;
    const applicantEmail = payload.form_response.answers.find(
      answer => answer.field.ref === 'email'
    ).email;
    const applicantGitHubIdResolvable = payload.form_response.answers
      .find(answer => answer.field.ref === 'github-id')
      .text.toLowerCase()
      .match(/[^/]+$/);
    const applicantGitHubId = isValidGitHubId(applicantGitHubIdResolvable)
      ? applicantGitHubIdResolvable
      : extractGitHubId(applicantGitHubIdResolvable);
    const calendlyEventURL = payload.form_response.answers.find(
      answer => answer.field.ref === 'calendly'
    ).url;
    const calendlyEventID = calendlyEventURL.match(/((\w{4,12}-?)){5}/)[0];

    console.log('[Values]', {
      applicantName,
      applicantEmail,
      applicantGitHubIdResolvable,
      applicantGitHubId,
      calendlyEventURL,
      calendlyEventID,
    });

    // Get Calendly event start date
    const calendlyEventResponse = await getCalendlyEvent(calendlyEventID);

    const startDateUTC = new Date(calendlyEventResponse.resource.start_time);
    const startDateKST = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul',
    })
      .format(startDateUTC)
      .replace(/[\s.]+/g, '');

    // Repository details as per the specified format
    const newRepoName = `${applicantGitHubId}-${startDateKST}`;
    const newRepoDescription = `${applicantName} <${applicantEmail}>`;

    console.log('[Values]', {
      calendlyEventResponse,
      startDateUTC,
      startDateKST,
      newRepoName,
      newRepoDescription,
    });

    await createGitHubRepo(newRepoName, newRepoDescription);

    await addGitHubCollaborator(newRepoName, applicantGitHubId);

    const dueDate = new Date(startDateUTC).setDate(startDateUTC.getDate() + 2);

    await createClickUpTask(applicantName, startDateUTC.getTime(), dueDate, newRepoName);

    return {
      statusCode: 200,
      body: JSON.stringify('Success'),
    };
  } catch (error) {
    console.error('[ERROR]', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
    };
  }
};

function isValidGitHubId(input) {
  return /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/.test(input);
}

function extractGitHubId(input) {
  const githubIdRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\n\s]+)\/?$/i;
  const match = input.match(githubIdRegex);

  if (match) {
    const githubId = match[1];
    return isValidGitHubId(githubId) ? githubId : null;
  } else if (isValidGitHubId(input)) {
    return input;
  }

  return null;
}
