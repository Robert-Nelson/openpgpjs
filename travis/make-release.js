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
      var processed = false;
      res.forEach(function (item) {
        if (item.tag_name == "LatestDev") {
          if (!processed) {
            processed = true;
            release.id = item.id;
            client.repos.editRelease(
              release,
              function (err, res) {
                if (!err) {
                  var assetCount = item.assets.length;
                  if (assetCount > 0) {
                    item.assets.forEach(function (asset) {
                      client.repos.deleteReleaseAsset(
                        {
                          "owner": release.owner,
                          "repo": release.repo,
                          "id": asset.id
                        },
                        function (err, res) {
                          if (--assetCount <= 0) {
                            uploadAssets(client, pkg, release);
                          }
                        }
                      );
                    });
                  } else {
                    uploadAssets(client, pkg, release);
                  }
                } else {
                  console.log("repos.editRelease:\n", err);
                }
              }
            );
          } else {
            client.repos.deleteRelease(
              {
                "owner": release.owner,
                "repo": release.repo,
                "id": item.id
              },
              function (err, res) {
                if (err) {
                  console.log("repos.deleteRelease:\n", err);
                }
              }
            );
          }
        }
      });
      if (!processed) {
        client.repos.createRelease(
          release,
          function (err, res) {
            if (!err) {
              release.id = res.id;
              uploadAssets(client, pkg, release);
            } else {
              console.log("repos.createRelease:\n", err);
            }
          }
        );
      }
    } else {
      console.log("repos.getAllReleases:\n", err);
    }
  }
);

function uploadAssets(client, pkg, release) {
  [ "openpgp.min.js", pkg.name + "-" + pkg.version + ".tgz" ].forEach(function (asset) {
    client.repos.uploadReleaseAsset(
      {
        "owner": release.owner,
        "repo": release.repo,
        "id": release.id,
        "content_type": "text/javascript",
        "name": asset,
        "content": fs.readFileSync("dist/" + asset)
      },
      function (err, res) {
        if (err) {
          console.log("repos.uploadReleaseAsset:\n", err);
        }
      }
    );
  });
}