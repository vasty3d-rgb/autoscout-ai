# AutoScout AI

Live car-search web app for Avito, Drom, and Auto.ru with scoring, price checks, and local image-quality analysis.

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:8766
```

## Deploy on Render Free

1. Create a GitHub repository and push these files.
2. Open Render and create a new Web Service from the repository.
3. Use the free plan.
4. Render can use `render.yaml` automatically, or set:
   - Build command: `npm install`
   - Start command: `npm start`

The app reads `PORT` from the hosting environment, so it works on Render without changing code.
