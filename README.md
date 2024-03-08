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

## Environment Variables

| Key                      | Value (Example)                      | Description                                      |
| ------------------------ | ------------------------------------ | ------------------------------------------------ |
| CALENDLY_TOKEN           | eyJr...                              | Calendly Personal Access Token                   |
| CLICKUP_GH_PR_FIELD_ID   | 747f0c73-6d7b-4cc9-b508-cac4f24a21bb | ClickUp GitHub Pull Request Custom Field Id      |
| CLICKUP_GH_REPO_FIELD_ID | 21d8a9f2-2a0a-4d44-ab60-ad37df1e490e | ClickUp GitHub Repository Custom Field Id        |
| CLICKUP_LIST_ID          | 9000001234                           | The list id of ClickUp                           |
| CLICKUP_TOKEN            | pk_00000000_0000000000...            | ClickUp API Token                                |
| GITHUB_ORG               | your-github-organization             | GitHub Organization Name                         |
| GITHUB_REVIEWER_ID       | heptacode                            | GitHub Account Id of the reviewer                |
| GITHUB_TEMPLATE_REPO     | heptacode-repo                       | GitHub Template Repository Name to be cloned     |
| GITHUB_TOKEN             | ghp_abcdefg...                       | GitHub Personal Access Token                     |
| GITHUB_USER_AGENT        | frontend-recruit-helper              | User Agent that will be used for GitHub REST API |
