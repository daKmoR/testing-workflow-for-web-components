# \<a11y-input>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation
```bash
npm i a11y-input
```

## Usage
```html
<script type="module">
  import 'a11y-input/a11y-input.js';
</script>

<a11y-input></a11y-input>
```

## Testing with Karma
To run the suite of karma tests, run
```bash
npm run test
```
or to run them in compatibility mode for legacy browsers
```bash
npm run test:compatibility
```

To run the tests in watch mode (for <abbr title="test driven development">TDD</abbr>, for example), run

```bash
npm run test:watch
```
or
```bash
npm run test:compatibility
```

## Testing with Karma via BrowserStack
To run the suite of karma tests in BrowserStack, run
```bash
npm run test:bs
```

## Managing Test Snapshots
You can manage the test snapshots using
```bash
npm run test:update-snapshots
```
or
```bash
npm run test:prune-snapshots
```


## Local Demo with `es-dev-server`
```bash
npm start
```
To run a local development server that serves the basic demo located in `demo/index.html`

```bash
npm start:compatibility
```
To run a local development server in compatibility mode for older browsers that serves the basic demo located in `demo/index.html`
