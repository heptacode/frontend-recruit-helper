import { typeformHandler } from './typeform.mjs';
import { githubHandler } from './github.mjs';

export const handler = async event => {
  console.log('[Event Logging]', event);
  try {
    const requiredEnvVars = [
      'CALENDLY_TOKEN',
      'CLICKUP_TOKEN',
      'CLICKUP_LIST_ID',
      'CLICKUP_GH_REPO_FIELD_ID',
      'CLICKUP_GH_PR_FIELD_ID',
      'GITHUB_ORG',
      'GITHUB_REVIEWER_ID',
      'GITHUB_TEMPLATE_REPO',
      'GITHUB_TOKEN',
      'GITHUB_USER_AGENT',
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      throw new Error(`[ERROR] Env not set properly: Missing ${missingEnvVars.join(', ')}`);
    }

    console.log('[event.rawPath]', event.rawPath);

    switch (event.rawPath) {
      case '/typeform':
        return typeformHandler(event);
      case '/github':
        return githubHandler(event);
      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Not found!' }),
        };
    }
  } catch (error) {
    console.error('[ERROR]', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
    };
  }
};
