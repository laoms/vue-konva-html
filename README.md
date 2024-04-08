### 1 Install via npm

```npm
npm install vue-konva-html --save
```

### 2 Usage examples

```html
<template>
  <v-stage :config="configKonva">
    <v-layer>
      <v-group :config="groupProps">
        <KonvaHtml
          :groupProps={...}
          :divProps={...}
          :transform=true
          :transformFunc=()=>{}
        >
          <div>
            <CustomComp></CustomComp>
          </div>
        </KonvaHtml>
      </v-group>
    </v-layer>
  </v-stage>
</template>
```

```javascript
import { KonvaHtml } from 'vue-konva-html'
```
