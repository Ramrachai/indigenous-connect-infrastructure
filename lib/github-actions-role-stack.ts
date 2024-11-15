import { Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class GitHubActionsRoleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const githubOrg: string = process.env.GITHUB_ORG ?? 'Ramrachai';
        const githubRepo: string = process.env.GITHUB_REPO ?? '*';
        const githubBranch: string = process.env.GITHUB_BRANCH ?? 'master';

        // Connect AWS via OIDC from Github
        const githubOidcProvider = new iam.OpenIdConnectProvider(this, 'GithubOidcProvider', {
            url: 'https://token.actions.githubusercontent.com',
            thumbprints: ['d89e3bd43d5d909b47a18977aa9d5ce36cee184c'],
        })

        const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
            assumedBy: new iam.FederatedPrincipal(
                githubOidcProvider.openIdConnectProviderArn,
                {
                    StringLike: {
                        'token.actions.githubusercontent.com:sub': `repo:${githubOrg}/${githubRepo}:ref:refs/heads/${githubBranch}`,
                        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                    }
                },
                'sts:AssumeRoleWithWebIdentity'
            ),
            roleName: 'github-actions-deployment-role'
        })

        githubActionsRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                "lambda:InvokeFunction",
                "lambda:UpdateFunctionCode",
                "lambda:GetFunctionConfiguration",
                "s3:*"
            ],

            resources: ["*"]
        }))
    }
}
