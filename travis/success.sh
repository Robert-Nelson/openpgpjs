#!/bin/bash
if [ "${TRAVIS_BRANCH}" == "master" -o true ]; then
    git config user.name="Travis Build"
    git config user.email="nobody@travis-ci.org"
    git tag --force -m "Latest tested version" LatestDev "${TRAVIS_COMMIT}"
    node travis/make-release.js
fi
