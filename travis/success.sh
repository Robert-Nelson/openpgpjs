#!/bin/bash
if [ "${TRAVIS_NODE_VERSION}" == "0.10" ]; then
    if [ "${TRAVIS_BRANCH}" == "master" -o true ]; then
        git clone --branch ${TRAVIS_BRANCH} https://github.com/${TRAVIS_REPO_SLUG}.git travis/github
        cd travis/github
        export GIT_ASKPASS=/bin/true
        git config user.name "Travis Build"
        git config user.email "nobody@travis-ci.org"
        git config credential.https://github.com.username ${GITHUB_TOKEN}
        cd ../..
        rm -rf travis/github
        node travis/make-release.js
    fi
fi
