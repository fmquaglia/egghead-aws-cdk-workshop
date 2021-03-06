import * as cdk from "@aws-cdk/core";
import * as apiGateway from "@aws-cdk/aws-apigateway";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";

import * as amplify from "@aws-cdk/aws-amplify";
import { SPADeploy } from "cdk-spa-deploy";

import { TodoDatabase } from "./todo-database";

export class TodoAppStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const todoDatabase = new TodoDatabase(this, "TodoDatabase");

        const logoBucket = new s3.Bucket(this, "LogoBucket", {
            publicReadAccess: true
        });

        const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
            publicReadAccess: true,
            websiteIndexDocument: "index.html"
        });

        new apiGateway.LambdaRestApi(this, "Endpoint", {
            handler: todoDatabase.todoHandler
        });

        new s3Deployment.BucketDeployment(this, "DeployLogo", {
            destinationBucket: logoBucket,
            retainOnDelete: true, // keep current files
            sources: [s3Deployment.Source.asset("assets")]
        });

        // const todoAmplifyApp = new amplify.CfnApp(this, "TodoAmplifyApp", {
        //     name: "todo-app",
        //     oauthToken: "5d2b0e970ea54d423c857fb1498d28f2967e02b1",
        //     repository: "https://github.com/tlakomy/egghead-aws-cdk-workshop"
        // });

        // new amplify.CfnBranch(this, "MasterBranch", {
        //     appId: todoAmplifyApp.attrAppId,
        //     branchName: "master"
        // });

        // Using the SPA Deploy construct from npm:

        // new SPADeploy(this, "spaDeploy").createBasicSite({
        //     indexDoc: "index.html",
        //     websiteFolder: "../frontend/build"
        // });

        // Deploying the site to an S3 bucket:
        new s3Deployment.BucketDeployment(this, "DeployWebsite", {
            sources: [s3Deployment.Source.asset("../frontend/build")],
            destinationBucket: websiteBucket
        });

        new cdk.CfnOutput(this, "WebsiteUrl", {
            value: websiteBucket.bucketWebsiteUrl
        });
    }
}

// Pre-database stack:
// export class TodoAppStack extends cdk.Stack {
//   constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     const logoBucket = new s3.Bucket(this, "LogoBucket", {
//       publicReadAccess: true
//     });

//     const helloLambda = new lambda.Function(this, "HelloLambda", {
//       runtime: lambda.Runtime.NODEJS_12_X,
//       code: lambda.Code.asset("lambda"),
//       handler: "hello.handler",
//       timeout: Duration.seconds(10),
//       memorySize: 256,
//       environment: { secret_db_key: "Password1" }
//     });

//     new apiGateway.LambdaRestApi(this, "Endpoint", {
//       handler: helloLambda
//     });

//     logoBucket.addEventNotification(
//       EventType.OBJECT_CREATED,
//       new s3Notifications.LambdaDestination(helloLambda)
//     );

//     new s3Deployment.BucketDeployment(this, "DeployLogo", {
//       destinationBucket: logoBucket,
//       retainOnDelete: true, // keep current files
//       sources: [s3Deployment.Source.asset("./assets")]
//     });
//   }
// }
