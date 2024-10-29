import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class IndigenousConnectInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubOrg = "ryancormack";
    const githubRepo = "*";
    const githubBranch = "main";


    // Connect github
    const githubOidcProvider =  new iam.OpenIdConnectProvider(this, 'GithubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      thumbprints: [process.env.THUMPRINT] as string[],

    
    },)

    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      assumedBy: new iam.FederatedPrincipal(
        githubOidcProvider.openIdConnectProviderArn,
        {
          StringLike: {
            'token.actions.githubusercontent.com:sub': `repo:${githubOrg}/${githubRepo}:ref:refs/heads/${githubBranch}`,
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      roleName: 'github-actions-deployment-role',
      inlinePolicies: {
        'githubActionPolicy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement(
              {
                actions: [
                  "lambda:*",
                  "s3:*"     
                ],

                resources: ["*"]
              }
            )
          ]
        })
      }
    })

    

    // create lambda for express-app 
    const expressAppLambda = new lambda.Function(this, 'ExpressAppLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../express-app")),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
    })

    // create api gateway
    const expressAppApi = new apigateway.LambdaRestApi(this, 'ExpressApiGateWay', {
      handler: expressAppLambda,
      proxy: true,
      description: 'API Gateway for express app',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
    })


    // output the api gateway url 
    new cdk.CfnOutput(this, 'ExpressAppUrl', {
      value: expressAppApi.url,
      description: 'API Gateway URL for express app',
    })
  }
}
