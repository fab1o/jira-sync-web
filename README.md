
# JiraSync.Web
*The web app for syncing two external Jiras on Node.js*

### SETUP

1. Check the Dependencies section below and make sure all dependencies have been installed and are up to date
2. add an entry on your hosts file to point 127.0.0.1 to jirasync.web or create and work with your own domain

### Branches / Pull Requests

The **master** branch is used for holding the most stable release of the app.

The **develop** branch is used for development and any feature/fix being worked on needs to be based off of this branch.

Make pull requests for your branch if you want it merged into the **develop** branch on remote (GITHUB).


### Versioning / Builds

When merging **develop** code into the **master** branch, the following steps must be done:

1. While in the **develop** branch, update version in project **/modules/assemblyInfo.js**

2. Create a [git tag](http://git-scm.com/book/en/v2/Git-Basics-Tagging) with the same version.

3. Commit and push the changes (including tags) to **develop** branch on remote (GITHUB).


### TO DO

- add documentation
- add SSL support
- switch working from memory session to cookie session on node.js and handle security
- add users
- add issueType and other dependencies for issues
- add comments
- add work log
- add sprints
- add stories
- add epics
- pagination for issues
- spinner for work in progress
- map everything so there can be sync in the future

### Challenges

- can't transfer the release date and start date for the versions from UNI to STP
- couldn't figure out how to add issueTypes to a project, seems to be possible only globally

### Dependencies

- [nodejs](https://nodejs.org/)
- [iisnode](https://github.com/tjanczuk/iisnode) (optional: to run on MS-IIS)
- [NTVS](https://github.com/Microsoft/nodejstools) (optional: to work with Visual Studio)

### License

This module is distributed under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/)