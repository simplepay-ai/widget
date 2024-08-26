# SimplePay Payment Widget

## Usage

### 1. Install package

```bash
npm install --save-dev @simplepay-ai/api-client
```

### 2. Import

As module:

```typescript
import '@simplepay-ai/api-client';
```

or as script:

```html
<script src="widget.js" type="module"></script>
```

### 3. Add component to desired place on page

```html
<payment-app
    price="0.8"
    appId="09476f0c-ed36-4dfe-84f4-ef2df1644830"
    clientId="bf298925-2f45-492c-891d-f997aa7ac864"
    backToStoreUrl="https://example.com"
    serverUrl="https://example.com/invoice"
/>
```

## Development

### Ensure proper code style

Run following command to format your code before commit:

```bash
npm run format
```

## Publishing

### 1. Increment version

Package uses [Semantic Versioning](https://semver.org). You should increment package version before publishing

If you introduce breaking changes, run:

```bash
npm version major
```

If your changes is backward-compatible, run:

```bash
npm version minor
```

If you fixed a bug, run:

```bash
npm version patch
```

### 2. Push to repository with tags

```bash
git push origin main --tags
```

New release and package version will be created automatically
