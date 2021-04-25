# Setup

1. Open the application in VS Code.

1. Open `config.js` file and update your credentials in base64 format. [www.base64encode.org](https://www.base64encode.org/)

1. Update the `parent` object with issue key only, eg. `EN-117326` and review sub-tasks.

1. Now open `app.js` go to line #52, comment that line and uncomment the axios request code block.

```javascript
  callback(); // --> comment this line and uncomment below axios request

  // axios(request)
  //   .then((result) => {
  //     logger.info(`Status: ${result.status} Data: ${result.data}`);
  //     callback();
  //   })
  //   .catch((err) => {
  //     logger.error(`Some error occured: ${err}`);
  //     process.exit(1);
  //   });
```
1. Run the application by pressing `F5`.
