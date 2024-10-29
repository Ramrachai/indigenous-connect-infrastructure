#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IndigenousConnectInfrastructureStack } from '../lib/indigenous-connect-infrastructure-stack';

const app = new cdk.App();
new IndigenousConnectInfrastructureStack(app, 'IndigenousConnectInfrastructureStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});