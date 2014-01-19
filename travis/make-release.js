var fs = require('fs');

var Client = require('github');

var repoPath = process.env['TRAVIS_REPO_SLUG'].split('/');

var owner = repoPath[0];
var repo = repoPath[1];
var token = process.env['GITHUB_TOKEN'];

var pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

var release = {
  "owner": owner,
  "repo": repo,
  "tag_name": "LatestDev",
  "name": "v" + pkg.version + " (Unstable)",
  "body": "This is a test of auto release.",
  "prerelease": true
};

var client = new Client(
  {
    version: "3.0.0"
  }
);

client.authenticate(
  {
    "type": "oauth",
    "token": token
  }
);

client.repos.getAllReleases(
  {
    "owner": release.owner,
    "repo": release.repo
  },
  function (err, res) {
    if (!err) {
      res.forEach(function (item) {
        if (item.tag_name == "LatestDev") {
          release.id = item.id;
          client.repos.editRelease(
            release,
            function (err, res) {
              if (err) {
                console.log("repos.editRelease:\n", err);
              }
            }
          );
        }
      });
      if (!release.id) {
        client.repos.createRelease(
          release,
          function (err, res) {
            if (!err) {
              release.id = res.id;
            } else {
              console.log("repos.createRelease:\n", err);
            }
          }
        );
      }
      if (release.id) {
        client.repos.uploadReleaseAsset(
          {
            "owner": release.owner,
            "repo": release.repo,
            "id": release.id,
            "content_type": "text/javascript",
            "name": "openpgp.min.js",
            "content": fs.readFileSync("dist/openpgp.min.js")
          },
          function (err, res) {
              console.log("repos.uploadReleaseAsset:\n", err, res);
          }
        );
      }
    } else {
      console.log("repos.getAllReleases:\n", err);
    }
  }
);
