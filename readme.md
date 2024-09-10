# Delegate2.name API

Fastify app running on GAE.

## Localhost env vars

On localhost create a `.env` file with environment variables:

```
MYLOCALHOST=true
AIRSTACK_API_KEY=
```

## GAE env vars

Go to Datastore on the Cloud Console and create the `EnvVar` kind. In the `EnvVar` kind create a new entity with key title `envkey` and add the name of the variable. Then create a variable titled `envval` with the value of whatever you want to store in it. 

## Notes

- The default branch must be `master`(not `main`), so that Google Cloud Repositories (GCR) can automatically pull changes. GCR only supports pulling from the `master` branch.

## Cloud Build

- Enable Cloud Build API, Cloud Tasks API & App Engine Admin API & Secret Manager API 
- Go to IAM and check the `Include Google-provided role grants` checkbox
  - Then give your "Cloud Build" service account the `Cloud Scheduler Admin` role
- Create App Engine app (europe-west).
  - This will also automatically create a Datastore database (it may take a few minutes).
- Connect your GitHub repo with Google Cloud Repositories:
  - Go to repositories: https://console.cloud.google.com/cloud-build/repositories/2nd-gen 
  - Click on "Create host connection" and connect your GitHub (org or personal account)
  - Click on "Link repositories" and select your repo on GitHub
- Open the Cloud Build Settings page, choose the service account **without** numbers, and set the status of 
  - the App Engine Admin role and 
  - the Service Account User role to Enabled
  - also select it as preferred service account!
- Then go to "Triggers" page and click on "Create trigger". 
  - Give it a name `Commit`, select 2nd Gen and select your repo.
- Run the trigger and check its logs.
- If you get an error, add the appropriate user to IAM
- Go to Cloud Tasks and create the `default` queue.
  - Make sure the region is europe-west1
  - Leave everything else the default

# Frames local debugging

Install [frame.js local debugger](https://framesjs.org/guides/debugger#local-installation):

```bash
npm install -g @frames.js/debugger
```

Run it with:

```bash
frames
```