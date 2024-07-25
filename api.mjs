import https from 'https';

// Function to make requests to services
export function makeAPIRequest(service, endpoint, options) {
  function getAPIURL(service) {
    switch (service) {
      case 'github':
        return 'https://api.github.com';
      case 'calendly':
        return 'https://api.calendly.com';
      case 'clickup':
        return 'https://api.clickup.com/api/v2';
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(`${getAPIURL(service)}${endpoint}`, options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(`[API Request Failed] ${res.statusCode} - ${data}`);
        }
      });
    });

    if (options.body) {
      req.write(options.body);
    }

    req.on('error', error => {
      reject(`[API Request Failed] ${error.message}`);
    });

    req.end();
  });
}

/**
 * Create repository using GitHub API
 * https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-using-a-template
 */
export async function createGitHubRepo(newRepoName, newRepoDescription) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_ORG = process.env.GITHUB_ORG;
  const GITHUB_TEMPLATE_REPO = process.env.GITHUB_TEMPLATE_REPO;
  const GITHUB_USER_AGENT = process.env.GITHUB_USER_AGENT;

  const endpoint = `/repos/${GITHUB_ORG}/${GITHUB_TEMPLATE_REPO}/generate`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': GITHUB_USER_AGENT,
    },
    body: JSON.stringify({
      owner: GITHUB_ORG,
      name: newRepoName,
      description: newRepoDescription,
      private: true,
      include_all_branches: false,
    }),
  };
  return await makeAPIRequest('github', endpoint, options);
}

/**
 * Add collaborator to the repository using GitHub API
 * https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2022-11-28#add-a-repository-collaborator
 */
export async function addGitHubCollaborator(repoName, applicantGitHubId) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_ORG = process.env.GITHUB_ORG;
  const GITHUB_TEMPLATE_REPO = process.env.GITHUB_TEMPLATE_REPO;
  const GITHUB_USER_AGENT = process.env.GITHUB_USER_AGENT;

  const endpoint = `/repos/${GITHUB_ORG}/${repoName}/collaborators/${applicantGitHubId}`;
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': GITHUB_USER_AGENT,
    },
    body: JSON.stringify({ permission: 'push' }),
  };
  return await makeAPIRequest('github', endpoint, options);
}

/**
 * Post comment to GitHub Pull Request
 */
export async function postGitHubPRComment(endpoint, comment) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USER_AGENT = process.env.GITHUB_USER_AGENT;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': GITHUB_USER_AGENT,
    },
    body: JSON.stringify({ body: comment }),
  };
  return await makeAPIRequest('github', endpoint, options);
}

/**
 * Archive GitHub Repository
 * https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#update-a-repository
 */
export async function archiveGitHubRepo(fullOrgRepoName) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USER_AGENT = process.env.GITHUB_USER_AGENT;

  const endpoint = `/repos/${fullOrgRepoName}`;
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': GITHUB_USER_AGENT,
    },
    body: JSON.stringify({ archived: true }),
  };
  return await makeAPIRequest('github', endpoint, options);
}

/**
 * Get Calendly event
 * https://developer.calendly.com/api-docs/e2f95ebd44914-get-event
 */
// export async function getCalendlyEvent(calendlyEventID){
//     const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;

//     const endpoint = `/scheduled_events/${calendlyEventID}`
//     const options = {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${CALENDLY_TOKEN}`,
//         }
//     };
//     return await makeAPIRequest('calendly', endpoint, options);
// }

/**
 * Get Calendly event by Applicant Email
 */
export async function getCalendlyEventByEmail(applicantEmail) {
  const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;
  const CALENDLY_USER_URI = process.env.CALENDLY_USER_URI;

  const endpoint = `/scheduled_events?invitee_email=${applicantEmail}&status=active&sort=start_time:desc&user=${CALENDLY_USER_URI}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CALENDLY_TOKEN}`,
    },
  };
  return await makeAPIRequest('calendly', endpoint, options);
}

/**
 * Create a task in ClickUp List
 * https://clickup.com/api/clickupreference/operation/CreateTask/
 */
export async function createClickUpTask(applicantName, startDate, dueDate, repoName) {
  const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;
  const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID;
  const CLICKUP_GH_REPO_FIELD_ID = process.env.CLICKUP_GH_REPO_FIELD_ID;

  const endpoint = `/list/${CLICKUP_LIST_ID}/task`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: CLICKUP_TOKEN,
    },
    body: JSON.stringify({
      name: applicantName,
      start_date: startDate,
      due_date: dueDate,
      custom_fields: [
        {
          // GitHub Repo Name
          id: CLICKUP_GH_REPO_FIELD_ID,
          value: repoName,
        },
      ],
    }),
  };
  return await makeAPIRequest('clickup', endpoint, options);
}

/**
 * Query ClickUp Task with Custom Field
 * https://clickup.com/api/clickupreference/operation/GetTasks/
 */
export async function queryClickUpTask(repoName) {
  const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;
  const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID;
  const CLICKUP_GH_REPO_FIELD_ID = process.env.CLICKUP_GH_REPO_FIELD_ID;

  const endpoint = `/list/${CLICKUP_LIST_ID}/task?custom_fields=[{"field_id":"${CLICKUP_GH_REPO_FIELD_ID}","operator":"=","value":"${repoName}"}]`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: CLICKUP_TOKEN,
    },
  };
  return await makeAPIRequest('clickup', endpoint, options);
}

/**
 * Update ClickUp task status
 * https://clickup.com/api/clickupreference/operation/UpdateTask/
 */
export async function updateClickUpTaskStatus(taskId) {
  const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;

  const endpoint = `/task/${taskId}`;
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: CLICKUP_TOKEN,
    },
    body: JSON.stringify({
      status: 'needs review',
    }),
  };
  return await makeAPIRequest('clickup', endpoint, options);
}

/**
 * Set ClickUp task custom field
 * https://clickup.com/api/clickupreference/operation/SetCustomFieldValue/
 */
export async function setClickUpTaskCustomField(taskId, pullRequestLink) {
  const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;
  const CLICKUP_GH_PR_FIELD_ID = process.env.CLICKUP_GH_PR_FIELD_ID;

  const endpoint = `/task/${taskId}/field/${CLICKUP_GH_PR_FIELD_ID}`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: CLICKUP_TOKEN,
    },
    body: JSON.stringify({
      value: pullRequestLink,
    }),
  };
  return await makeAPIRequest('clickup', endpoint, options);
}
