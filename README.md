# frontend-recruit-helper

Automated script for Front-end applicants' test process.

## Services

- AWS Lambda
  - Receive webhooks
  - Run automated jobs (clone repo, add collaborator, archive repo, ...)
- Typeform
  - Receive name, email, GitHub id from the applicant
  - Send webhook call to AWS Lambda
- Calendly
  - Applicant availability scheduling
  - Test doc sending automation
- ClickUp
  - Track test review status

## Environment Variables

| Key                      | Description                                      | Value (Example)                                                     |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------- |
| CALENDLY_TOKEN           | Calendly Personal Access Token                   | eyJr...                                                             |
| CALENDLY_USER_URI        | Calendly User Unique Identifier URI              | https://api.calendly.com/users/a713c84e-34c9-4d90-bb8d-e89cc5eb518c |
| CLICKUP_GH_PR_FIELD_ID   | ClickUp GitHub Pull Request Custom Field Id      | 747f0c73-6d7b-4cc9-b508-cac4f24a21bb                                |
| CLICKUP_GH_REPO_FIELD_ID | ClickUp GitHub Repository Custom Field Id        | 21d8a9f2-2a0a-4d44-ab60-ad37df1e490e                                |
| CLICKUP_LIST_ID          | The list id of ClickUp                           | 9000001234                                                          |
| CLICKUP_TOKEN            | ClickUp API Token                                | pk_00000000_0000000000...                                           |
| GITHUB_ORG               | GitHub Organization Name                         | your-github-organization                                            |
| GITHUB_REVIEWER_ID       | GitHub Account Id of the reviewer                | heptacode                                                           |
| GITHUB_TEMPLATE_REPO     | GitHub Template Repository Name to be cloned     | heptacode-repo                                                      |
| GITHUB_TOKEN             | GitHub Personal Access Token                     | ghp_abcdefg...                                                      |
| GITHUB_USER_AGENT        | User Agent that will be used for GitHub REST API | frontend-recruit-helper                                             |
