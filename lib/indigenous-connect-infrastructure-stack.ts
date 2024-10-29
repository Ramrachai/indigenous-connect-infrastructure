import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";

export class IndigenousConnectInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
