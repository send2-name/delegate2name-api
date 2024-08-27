import { Datastore } from '@google-cloud/datastore';

const datastore = new Datastore({
  projectId: 'delegate2name-api'
});

export async function getEnvVar(varkey) {
    const query = datastore.createQuery('EnvVar');

    query.filter('varkey', varkey);

    const [results] = await datastore.runQuery(query);

    // Check if the results are empty
    if (results.length === 0) {
      console.log('No results found');
    } else {
      // Get the first result
      const result = results[0];

      // Get the varval value
      const varValue = result['varval'];

      return varValue;
    }
}

export async function setEnvVar(varkey, varval) {
    const entity = {
      key: datastore.key(['EnvVar', varkey]),
      data: {
        varkey: varkey,
        varval: varval
      }
    };

    await datastore.save(entity);
}