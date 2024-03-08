import {
  postGitHubPRComment,
  archiveGitHubRepo,
  queryClickUpTask,
  updateClickUpTaskStatus,
  setClickUpTaskCustomField,
} from './api.mjs';

export const githubHandler = async event => {
  console.log('[GitHub Handler]');
  try {
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body) {
      console.log('[BAD REQUEST] No event.body: ', event.body);
      return {
        statusCode: 400,
        body: JSON.stringify('Bad Request'),
      };
    }

    const GITHUB_REVIEWER_ID = process.env.GITHUB_REVIEWER_ID;

    switch (event.headers['x-github-event']) {
      case 'pull_request':
        if (body.action === 'review_requested') {
          const isReviewerMatched = body.pull_request.requested_reviewers.some(
            reviewer => reviewer.login === GITHUB_REVIEWER_ID
          );
          const fullOrgRepoName = body.pull_request.base.repo.full_name;
          const repoName = body.pull_request.base.repo.name;

          if (isReviewerMatched && fullOrgRepoName) {
            const postCommentAPIEndpoint = body.pull_request.comments_url.replace(
              'https://api.github.com',
              ''
            );
            const comment = `Your test has been successfully submitted.\nThank you.`;

            await postGitHubPRComment(postCommentAPIEndpoint, comment);

            await archiveGitHubRepo(fullOrgRepoName);

            const clickUpResponse = await queryClickUpTask(repoName);

            if (clickUpResponse.tasks.length) {
              const taskId = clickUpResponse.tasks[0].id;
              const pullRequestLink = body.pull_request.html_url;

              await updateClickUpTaskStatus(taskId);
              await setClickUpTaskCustomField(taskId, pullRequestLink);
            }
          }
        }
        break;
    }

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
