const state = {
  image: null,
  imageName: "",
  maps: {},
};

const fileInput = document.getElementById("file-input");
const uploadZone = document.getElementById("upload-zone");
const resolutionSelect = document.getElementById("resolution-select");
const exportProfileSelect = document.getElementById("export-profile-select");
const languageSelect = document.getElementById("language-select");
const materialSelect = document.getElementById("material-select");
const themeSelect = document.getElementById("theme-select");
const normalStrength = document.getElementById("normal-strength");
const detailStrength = document.getElementById("detail-strength");
const preserveAspectToggle = document.getElementById("preserve-aspect-toggle");
const seamlessToggle = document.getElementById("seamless-toggle");
const normalStrengthValue = document.getElementById("normal-strength-value");
const detailStrengthValue = document.getElementById("detail-strength-value");
const generateBtn = document.getElementById("generate-btn");
const downloadAllBtn = document.getElementById("download-all-btn");
const statusText = document.getElementById("status-text");
const sourceMeta = document.getElementById("source-meta");
const resultsMeta = document.getElementById("results-meta");

const mapCanvases = {
  albedo: document.getElementById("albedo-canvas"),
  height: document.getElementById("height-canvas"),
  normal: document.getElementById("normal-canvas"),
  roughness: document.getElementById("roughness-canvas"),
  ao: document.getElementById("ao-canvas"),
  metallic: document.getElementById("metallic-canvas"),
};

const mapTitleElements = {
  albedo: document.querySelector('[data-map-title="albedo"]'),
  height: document.querySelector('[data-map-title="height"]'),
  normal: document.querySelector('[data-map-title="normal"]'),
  roughness: document.querySelector('[data-map-title="roughness"]'),
  ao: document.querySelector('[data-map-title="ao"]'),
  metallic: document.querySelector('[data-map-title="metallic"]'),
};

const mapCardElements = Object.fromEntries(
  Object.entries(mapTitleElements).map(([key, element]) => [key, element.closest(".map-card")])
);

const sourceCanvas = document.getElementById("source-canvas");
const downloadButtons = Array.from(document.querySelectorAll("[data-download]"));
const mapDescElements = Array.from(document.querySelectorAll(".map-desc"));

const I18N = {
  zh: {
    pageTitle: "PBR 材质生成器",
    heroTitle: "PBR 材质生成器",
    heroText: "上传一张参考图，快速生成常见 PBR 通道贴图。",
    heroLabels: { language: "语言", theme: "主题", output: "输出", processing: "处理", size: "尺寸" },
    heroValues: { output: "6 通道", processing: "本地生成", size: "512 - 4096" },
    controlsTitle: "生成设置",
    controlsText: "上传图片后，浏览器会直接在本地生成贴图。",
    uploadTitle: "拖拽图片到这里，或点击选择文件",
    uploadText: "推荐使用正面、光照相对均匀、尽量无强透视的材质照片",
    resolution: "输出分辨率",
    materialType: "材质倾向",
    normalStrength: "法线强度",
    detailStrength: "高度细节",
    generate: "生成 PBR 贴图",
    tipGood: "更适合",
    tipGoodText: "平视、均匀光照、无明显透视变形的材质图",
    tipResult: "结果预期",
    tipResultText: "适合概念验证和快速打样，不等同于高精度扫描",
    sourceTitle: "源图预览",
    sourceText: "可选择保留原图比例，或先做基础无缝处理后再生成通道。",
    sourceInput: "输入纹理",
    preserveTitle: "保持原图尺寸",
    preserveText: "输出时保留原图宽高比，最长边按所选分辨率缩放。",
    seamlessTitle: "无缝",
    seamlessText: "对输入图做基础去接缝处理，减少平铺时边缘断层。",
    outputTitle: "输出通道",
    exportTarget: "导出目标",
    downloadZip: "下载 ZIP",
    download: "下载",
    statuses: {
      idle: "等待上传图片。",
      loaded: "图片已加载，可以开始生成 PBR 贴图。",
      generating: "正在生成贴图，请稍等...",
      generated: "已生成贴图。提示：单张图片推断的 PBR 结果更适合快速打样，不等同于扫描级材质。",
      stale: "当前结果已过期，请重新生成。",
      emptyResults: "尚未生成结果。修改参数后需要重新生成。",
      zipLoading: "ZIP 组件尚未加载完成，请稍后再试。",
      zipStarted: "ZIP 已开始下载。",
      zipFailed: "ZIP 打包失败，请重试。",
      zipPacking: "打包中...",
      changedParam: "参数已修改，请重新生成贴图。",
      changedMaterial: "材质倾向已修改，请重新生成贴图。",
      changedPreprocess: "预处理选项已更新，请重新生成贴图以应用新的输出方式。",
      changedResolution: "分辨率已修改，请重新生成贴图以应用新的输出尺寸。"
    },
    resultsMeta: {
      generated: (size, material, target) => `最近输出：${size} · ${material} · 导出目标：${target}`,
    },
    themes: { dark: "深色", light: "浅色" },
    exportProfiles: {
      generic: "通用 Metal/Rough",
      blender: "Blender",
      unreal: "Unreal Engine",
      vray: "V-Ray",
      keyshot: "KeyShot",
    },
    materials: {
      auto: "自动判断",
      concrete: "水泥 / 石材",
      wood: "木材",
      fabric: "布料 / 地毯",
      plastic: "塑料 / 橡胶",
      metal: "金属",
    },
    mapDescriptions: {
      albedo: "压掉原图明暗影响，保留更干净的表面颜色。",
      height: "根据亮度与局部反差估算微表面起伏。",
      normal: "从 Height 衍生出的切线空间法线贴图。",
      roughness: "根据材质类型与纹理细节估算粗糙度。",
      ao: "增强凹陷、裂缝和接缝区域的遮蔽感。",
      metallic: "按材质倾向估算金属度，非金属通常接近 0。",
    },
  },
  en: {
    pageTitle: "PBR Material Generator",
    heroTitle: "PBR Material Generator",
    heroText: "Upload one reference image and quickly generate common PBR texture channels.",
    heroLabels: { language: "Language", theme: "Theme", output: "Output", processing: "Process", size: "Size" },
    heroValues: { output: "6 channels", processing: "Local only", size: "512 - 4096" },
    controlsTitle: "Generation Settings",
    controlsText: "After upload, the browser generates maps locally on your device.",
    uploadTitle: "Drop an image here, or click to choose a file",
    uploadText: "Front-facing, evenly lit, low-perspective texture photos work best",
    resolution: "Output Resolution",
    materialType: "Material Type",
    normalStrength: "Normal Strength",
    detailStrength: "Height Detail",
    generate: "Generate PBR Maps",
    tipGood: "Best For",
    tipGoodText: "Front-facing materials with even lighting and minimal perspective distortion",
    tipResult: "Expected Result",
    tipResultText: "Suitable for concept validation and fast lookdev, not scan-grade capture",
    sourceTitle: "Source Preview",
    sourceText: "Keep the original aspect ratio or apply basic seamless processing before generation.",
    sourceInput: "Input Texture",
    preserveTitle: "Keep Original Aspect",
    preserveText: "Preserve the original aspect ratio and scale the longest side to the selected resolution.",
    seamlessTitle: "Seamless",
    seamlessText: "Apply basic seam reduction before generation to improve tiling continuity.",
    outputTitle: "Output Channels",
    exportTarget: "Export Target",
    downloadZip: "Download ZIP",
    download: "Download",
    statuses: {
      idle: "Waiting for an image upload.",
      loaded: "Image loaded. You can generate PBR maps now.",
      generating: "Generating maps, please wait...",
      generated: "Maps generated. Note: single-image PBR inference is suitable for fast lookdev, not scan-grade materials.",
      stale: "Current output is outdated. Please regenerate.",
      emptyResults: "No generated output yet. Regenerate after changing parameters.",
      zipLoading: "ZIP library is still loading. Please try again shortly.",
      zipStarted: "ZIP download started.",
      zipFailed: "ZIP packaging failed. Please try again.",
      zipPacking: "Packing...",
      changedParam: "Parameters changed. Please regenerate the maps.",
      changedMaterial: "Material type changed. Please regenerate the maps.",
      changedPreprocess: "Preprocess options changed. Please regenerate to apply them.",
      changedResolution: "Resolution changed. Please regenerate to apply the new output size."
    },
    resultsMeta: {
      generated: (size, material, target) => `Latest output: ${size} · ${material} · Export target: ${target}`,
    },
    themes: { dark: "Dark", light: "Light" },
    exportProfiles: {
      generic: "Generic Metal/Rough",
      blender: "Blender",
      unreal: "Unreal Engine",
      vray: "V-Ray",
      keyshot: "KeyShot",
    },
    materials: {
      auto: "Auto Detect",
      concrete: "Concrete / Stone",
      wood: "Wood",
      fabric: "Fabric / Carpet",
      plastic: "Plastic / Rubber",
      metal: "Metal",
    },
    mapDescriptions: {
      albedo: "Reduce lighting influence from the source and keep cleaner surface color.",
      height: "Estimate micro-surface elevation from luminance and local contrast.",
      normal: "Tangent-space normal map derived from the height map.",
      roughness: "Estimate surface roughness from material type and texture detail.",
      ao: "Enhance occlusion in recesses, cracks, and seams.",
      metallic: "Estimate metalness from material bias. Non-metals are usually close to zero.",
    },
  },
};

const EXPORT_PROFILES = {
  generic: {
    label: { zh: "通用 Metal/Rough", en: "Generic Metal/Rough" },
    zipSuffix: "generic",
    activeMaps: ["albedo", "height", "normal", "roughness", "ao", "metallic"],
    maps: {
      albedo: { title: { zh: "基础颜色", en: "Base Color" }, fileSuffix: "BaseColor", sourceKey: "albedo" },
      height: { title: { zh: "高度", en: "Height" }, fileSuffix: "Height", sourceKey: "height" },
      normal: { title: { zh: "法线", en: "Normal" }, fileSuffix: "Normal", sourceKey: "normal" },
      roughness: { title: { zh: "粗糙度", en: "Roughness" }, fileSuffix: "Roughness", sourceKey: "roughness" },
      ao: { title: { zh: "环境遮蔽", en: "Ambient Occlusion" }, fileSuffix: "AO", sourceKey: "ao" },
      metallic: { title: { zh: "金属度", en: "Metallic" }, fileSuffix: "Metallic", sourceKey: "metallic" },
    },
  },
  blender: {
    label: { zh: "Blender", en: "Blender" },
    zipSuffix: "blender",
    activeMaps: ["albedo", "height", "normal", "roughness", "metallic"],
    maps: {
      albedo: { title: { zh: "基础颜色", en: "Base Color" }, fileSuffix: "BaseColor", sourceKey: "albedo" },
      height: { title: { zh: "置换", en: "Displacement" }, fileSuffix: "Displacement", sourceKey: "height" },
      normal: { title: { zh: "法线", en: "Normal" }, fileSuffix: "Normal", sourceKey: "normal" },
      roughness: { title: { zh: "粗糙度", en: "Roughness" }, fileSuffix: "Roughness", sourceKey: "roughness" },
      ao: { title: { zh: "环境遮蔽", en: "Ambient Occlusion" }, fileSuffix: "AO", sourceKey: "ao" },
      metallic: { title: { zh: "金属度", en: "Metallic" }, fileSuffix: "Metallic", sourceKey: "metallic" },
    },
  },
  unreal: {
    label: { zh: "Unreal Engine", en: "Unreal Engine" },
    zipSuffix: "ue",
    activeMaps: ["albedo", "normal", "roughness", "ao", "metallic"],
    maps: {
      albedo: { title: { zh: "基础颜色", en: "Base Color" }, fileSuffix: "BaseColor", sourceKey: "albedo" },
      height: { title: { zh: "高度", en: "Height" }, fileSuffix: "Height", sourceKey: "height" },
      normal: { title: { zh: "法线", en: "Normal" }, fileSuffix: "Normal", sourceKey: "normal" },
      roughness: { title: { zh: "粗糙度", en: "Roughness" }, fileSuffix: "Roughness", sourceKey: "roughness" },
      ao: { title: { zh: "环境遮蔽", en: "Ambient Occlusion" }, fileSuffix: "AmbientOcclusion", sourceKey: "ao" },
      metallic: { title: { zh: "金属度", en: "Metallic" }, fileSuffix: "Metallic", sourceKey: "metallic" },
    },
  },
  vray: {
    label: { zh: "V-Ray", en: "V-Ray" },
    zipSuffix: "vray",
    activeMaps: ["albedo", "normal", "roughness", "metallic", "height"],
    maps: {
      albedo: { title: { zh: "漫反射", en: "Diffuse" }, fileSuffix: "Diffuse", sourceKey: "albedo" },
      height: { title: { zh: "置换", en: "Displacement" }, fileSuffix: "Displacement", sourceKey: "height" },
      normal: { title: { zh: "凹凸 / 法线", en: "Bump / Normal" }, fileSuffix: "Normal", sourceKey: "normal" },
      roughness: { title: { zh: "反射粗糙度", en: "Reflection Roughness" }, fileSuffix: "ReflectionRoughness", sourceKey: "roughness" },
      ao: { title: { zh: "环境遮蔽", en: "Ambient Occlusion" }, fileSuffix: "AO", sourceKey: "ao" },
      metallic: {
        title: { zh: "反射颜色", en: "Reflection Color" },
        fileSuffix: "Reflection",
        sourceKey: "specular",
        description: {
          zh: "基于基础颜色、金属度与粗糙度估算的反射颜色，适合 V-Ray 常见反射工作流。",
          en: "Estimated reflection color derived from base color, metalness, and roughness for common V-Ray workflows.",
        },
      },
    },
  },
  keyshot: {
    label: { zh: "KeyShot", en: "KeyShot" },
    zipSuffix: "keyshot",
    activeMaps: ["albedo", "normal", "roughness", "metallic"],
    maps: {
      albedo: { title: { zh: "基础颜色", en: "Base Color" }, fileSuffix: "BaseColor", sourceKey: "albedo" },
      height: { title: { zh: "置换", en: "Displacement" }, fileSuffix: "Displacement", sourceKey: "height" },
      normal: { title: { zh: "凹凸 / 法线", en: "Bump / Normal" }, fileSuffix: "Bump", sourceKey: "normal" },
      roughness: { title: { zh: "粗糙度", en: "Roughness" }, fileSuffix: "Roughness", sourceKey: "roughness" },
      ao: { title: { zh: "透明度", en: "Opacity" }, fileSuffix: "Opacity", sourceKey: "opacity" },
      metallic: {
        title: { zh: "镜面 / 反射颜色", en: "Specular / Reflection Color" },
        fileSuffix: "SpecularColor",
        sourceKey: "specular",
        description: {
          zh: "基于基础颜色、金属度与粗糙度估算的镜面反射颜色，更贴近 KeyShot 常见材质节点用法。",
          en: "Estimated specular color derived from base color, metalness, and roughness for common KeyShot material setups.",
        },
      },
    },
  },
};

bindResolutionControls();
bindExportProfile();
applyExportProfile();
bindThemeControl();
bindLanguageControl();

normalStrength.addEventListener("input", () => {
  normalStrengthValue.textContent = Number(normalStrength.value).toFixed(1);
  markOutputsStale(t().statuses.changedParam);
});

detailStrength.addEventListener("input", () => {
  detailStrengthValue.textContent = Number(detailStrength.value).toFixed(1);
  markOutputsStale(t().statuses.changedParam);
});

materialSelect.addEventListener("change", () => {
  markOutputsStale(t().statuses.changedMaterial);
});

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  await loadImageFile(file);
});

[preserveAspectToggle, seamlessToggle].forEach((toggle) => {
  toggle.addEventListener("change", () => {
    refreshSourcePreview();
    markOutputsStale(t().statuses.changedPreprocess);
  });
});

["dragenter", "dragover"].forEach((type) => {
  uploadZone.addEventListener(type, (event) => {
    event.preventDefault();
    uploadZone.classList.add("is-dragover");
  });
});

["dragleave", "drop"].forEach((type) => {
  uploadZone.addEventListener(type, (event) => {
    event.preventDefault();
    uploadZone.classList.remove("is-dragover");
  });
});

uploadZone.addEventListener("drop", async (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (!file) {
    return;
  }

  fileInput.files = event.dataTransfer.files;
  await loadImageFile(file);
});

generateBtn.addEventListener("click", async () => {
  if (!state.image) {
    return;
  }

  setStatus("generating");
  generateBtn.disabled = true;

  await new Promise((resolve) => requestAnimationFrame(resolve));

  const resolution = Number(resolutionSelect.value);
  const profile = materialSelect.value;
  const normalScale = Number(normalStrength.value);
  const detailScale = Number(detailStrength.value);
  const baseData = prepareSourceImageData(state.image, resolution, {
    preserveAspect: preserveAspectToggle.checked,
    seamless: seamlessToggle.checked,
    canvas: sourceCanvas,
  });
  const mapSet = buildPbrMaps(baseData, profile, normalScale, detailScale);

  state.maps = mapSet;
  renderMaps();
  updateResultsMeta(profile, baseData.width, baseData.height);
  enableDownloads();

  setStatus("generated");
  generateBtn.disabled = false;
});

downloadAllBtn.addEventListener("click", downloadAllAsZip);

downloadButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.download;
    if (!key) {
      return;
    }
    downloadCanvas(mapCanvases[key], getFileName(key));
  });
});

async function loadImageFile(file) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(imageUrl);
    state.image = image;
    state.imageName = file.name.replace(/\.[^/.]+$/, "");
    uploadZone.classList.add("has-image");
    generateBtn.disabled = false;
    downloadAllBtn.disabled = true;
    downloadButtons.forEach((button) => {
      button.disabled = true;
    });
    sourceMeta.textContent = `${file.name} | ${image.width} x ${image.height}`;
    setStatus("loaded");
    refreshSourcePreview();
    clearMapCanvases();
    state.maps = {};
    resetResultsMeta();
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function setCanvasSize(canvas, width, height = width) {
  canvas.width = width;
  canvas.height = height;
  canvas.style.aspectRatio = `${width} / ${height}`;
}

function prepareSourceImageData(image, resolution, options) {
  const { width, height } = getOutputDimensions(
    image,
    resolution,
    options.preserveAspect
  );

  setCanvasSize(options.canvas, width, height);
  const ctx = options.canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, width, height);

  if (options.preserveAspect) {
    ctx.drawImage(image, 0, 0, width, height);
  } else {
    const sourceSize = Math.min(image.width, image.height);
    const sx = (image.width - sourceSize) / 2;
    const sy = (image.height - sourceSize) / 2;
    ctx.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, width, height);
  }

  let imageData = ctx.getImageData(0, 0, width, height);

  if (options.seamless) {
    imageData = makeSeamless(imageData);
    ctx.putImageData(imageData, 0, 0);
  }

  sourceMeta.textContent = `${state.imageName || "未命名"} | 预览 ${width} x ${height}`;
  return imageData;
}

function refreshSourcePreview() {
  if (!state.image) {
    return;
  }

  const resolution = Number(resolutionSelect.value);
  const imageData = prepareSourceImageData(state.image, resolution, {
    preserveAspect: preserveAspectToggle.checked,
    seamless: seamlessToggle.checked,
    canvas: sourceCanvas,
  });
  syncOutputPlaceholderSize();
  return imageData;
}

function clearMapCanvases() {
  Object.values(mapCanvases).forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

function syncOutputPlaceholderSize() {
  if (!state.image) {
    return;
  }

  const resolution = Number(resolutionSelect.value);
  const { width, height } = getOutputDimensions(
    state.image,
    resolution,
    preserveAspectToggle.checked
  );

  Object.values(mapCanvases).forEach((canvas) => {
    setCanvasSize(canvas, width, height);
  });
}

function buildPbrMaps(imageData, profile, normalScale, detailScale) {
  const { data } = imageData;
  const { width, height } = imageData;
  const pixelCount = width * height;
  const luminance = new Float32Array(pixelCount);
  const saturation = new Float32Array(pixelCount);
  const localContrast = new Float32Array(pixelCount);
  const profileConfig = getProfileConfig(profile);

  for (let i = 0; i < pixelCount; i += 1) {
    const offset = i * 4;
    const r = data[offset] / 255;
    const g = data[offset + 1] / 255;
    const b = data[offset + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    luminance[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    saturation[i] = max === 0 ? 0 : (max - min) / max;
  }

  const blurred = boxBlur(luminance, width, height, 2);
  for (let i = 0; i < localContrast.length; i += 1) {
    localContrast[i] = Math.abs(luminance[i] - blurred[i]);
  }

  const heightMap = new Float32Array(pixelCount);
  const roughness = new Float32Array(pixelCount);
  const ao = new Float32Array(pixelCount);
  const metallic = new Float32Array(pixelCount);
  const albedoData = new Uint8ClampedArray(pixelCount * 4);
  const specularData = new Uint8ClampedArray(pixelCount * 4);
  const opacityData = new Uint8ClampedArray(pixelCount * 4);

  const meanLum = averageOf(luminance);
  const meanSat = averageOf(saturation);
  const inferredMetal = profile === "auto" ? meanSat < 0.22 && meanLum > 0.42 : profile === "metal";

  for (let i = 0; i < pixelCount; i += 1) {
    const offset = i * 4;
    const lum = luminance[i];
    const sat = saturation[i];
    const contrast = localContrast[i];

    heightMap[i] = clamp01(lum * 0.55 + contrast * 1.6 * detailScale + sat * 0.12);
    roughness[i] = clamp01(
      profileConfig.baseRoughness +
        (1 - sat) * profileConfig.satWeight +
        contrast * profileConfig.contrastWeight +
        (1 - lum) * profileConfig.shadowWeight
    );
    ao[i] = clamp01(1 - contrast * 2.4 - Math.abs(lum - meanLum) * 0.85);
    metallic[i] = clamp01(inferredMetal ? 0.82 - sat * 0.24 + contrast * 0.2 : profileConfig.metallicBias);

    const shaded = removeLighting(data[offset], data[offset + 1], data[offset + 2], lum, meanLum);
    albedoData[offset] = shaded[0];
    albedoData[offset + 1] = shaded[1];
    albedoData[offset + 2] = shaded[2];
    albedoData[offset + 3] = 255;

    const metalness = metallic[i];
    const dielectricSpec = clamp01(0.16 + (1 - roughness[i]) * 0.1);
    const specularR = mix(dielectricSpec, shaded[0] / 255, metalness);
    const specularG = mix(dielectricSpec, shaded[1] / 255, metalness);
    const specularB = mix(dielectricSpec, shaded[2] / 255, metalness);

    specularData[offset] = Math.round(specularR * 255);
    specularData[offset + 1] = Math.round(specularG * 255);
    specularData[offset + 2] = Math.round(specularB * 255);
    specularData[offset + 3] = 255;

    const opacity = data[offset + 3] / 255;
    const opacityValue = Math.round(opacity * 255);
    opacityData[offset] = opacityValue;
    opacityData[offset + 1] = opacityValue;
    opacityData[offset + 2] = opacityValue;
    opacityData[offset + 3] = 255;
  }

  const normal = buildNormalMap(heightMap, width, height, normalScale);

  return {
    albedo: new ImageData(albedoData, width, height),
    height: grayscaleToImageData(heightMap, width, height),
    normal,
    roughness: grayscaleToImageData(roughness, width, height),
    ao: grayscaleToImageData(ao, width, height),
    metallic: grayscaleToImageData(metallic, width, height),
    specular: new ImageData(specularData, width, height),
    opacity: new ImageData(opacityData, width, height),
  };
}

function getProfileConfig(profile) {
  const profiles = {
    auto: { baseRoughness: 0.5, satWeight: 0.22, contrastWeight: 0.8, shadowWeight: 0.18, metallicBias: 0.02 },
    concrete: { baseRoughness: 0.74, satWeight: 0.18, contrastWeight: 0.9, shadowWeight: 0.16, metallicBias: 0.0 },
    wood: { baseRoughness: 0.52, satWeight: 0.16, contrastWeight: 0.62, shadowWeight: 0.22, metallicBias: 0.0 },
    fabric: { baseRoughness: 0.78, satWeight: 0.2, contrastWeight: 0.48, shadowWeight: 0.18, metallicBias: 0.0 },
    plastic: { baseRoughness: 0.32, satWeight: 0.15, contrastWeight: 0.36, shadowWeight: 0.12, metallicBias: 0.02 },
    metal: { baseRoughness: 0.24, satWeight: 0.08, contrastWeight: 0.45, shadowWeight: 0.08, metallicBias: 0.85 },
  };

  return profiles[profile] || profiles.auto;
}

function removeLighting(r, g, b, lum, meanLum) {
  const lumAdjustment = clamp(0.92 + (meanLum - lum) * 0.68, 0.72, 1.22);
  const satLift = 1.05;

  const channels = [r, g, b].map((channel) => clamp(channel * lumAdjustment * satLift, 0, 255));
  return channels.map((channel) => Math.round(channel));
}

function buildNormalMap(heightMap, width, height, strength) {
  const normalData = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;

      const left = heightMap[y * width + Math.max(0, x - 1)];
      const right = heightMap[y * width + Math.min(width - 1, x + 1)];
      const top = heightMap[Math.max(0, y - 1) * width + x];
      const bottom = heightMap[Math.min(height - 1, y + 1) * width + x];

      const dx = (right - left) * strength;
      const dy = (bottom - top) * strength;
      const dz = 1;
      const length = Math.hypot(dx, dy, dz) || 1;

      const nx = dx / length;
      const ny = dy / length;
      const nz = dz / length;

      const offset = index * 4;
      normalData[offset] = Math.round((nx * 0.5 + 0.5) * 255);
      normalData[offset + 1] = Math.round((1 - (ny * 0.5 + 0.5)) * 255);
      normalData[offset + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalData[offset + 3] = 255;
    }
  }

  return new ImageData(normalData, width, height);
}

function grayscaleToImageData(values, width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < values.length; i += 1) {
    const value = Math.round(clamp01(values[i]) * 255);
    const offset = i * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = 255;
  }

  return new ImageData(data, width, height);
}

function boxBlur(values, width, height, radius) {
  const output = new Float32Array(values.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;

      for (let oy = -radius; oy <= radius; oy += 1) {
        const py = clamp(y + oy, 0, height - 1);
        for (let ox = -radius; ox <= radius; ox += 1) {
          const px = clamp(x + ox, 0, width - 1);
          sum += values[py * width + px];
          count += 1;
        }
      }

      output[y * width + x] = sum / count;
    }
  }

  return output;
}

function renderMaps() {
  const exportProfile = getExportProfile();

  Object.entries(mapCanvases).forEach(([slotKey, canvas]) => {
    const sourceKey = getMapSourceKey(slotKey, exportProfile);
    const imageData = state.maps[sourceKey];

    if (!imageData) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    setCanvasSize(canvas, imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
  });
}

function updateResultsMeta(profile, width, height) {
  const profileLabel =
    materialSelect.options[materialSelect.selectedIndex]?.textContent || profile;
  const exportLabel = getExportProfile().label[currentLanguage()];
  resultsMeta.textContent = t().resultsMeta.generated(`${width} x ${height}`, profileLabel, exportLabel);
}

function enableDownloads() {
  downloadAllBtn.disabled = false;
  downloadButtons.forEach((button) => {
    const key = button.dataset.download;
    button.disabled = !getExportProfile().activeMaps.includes(key) || !state.maps[getMapSourceKey(key)];
  });
}

function downloadCanvas(canvas, fileName) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}

async function downloadAllAsZip() {
  if (!window.JSZip) {
    statusText.textContent = t().statuses.zipLoading;
    return;
  }

  downloadAllBtn.disabled = true;
  downloadAllBtn.textContent = t().statuses.zipPacking;

  try {
    const zip = new window.JSZip();
    const baseName = state.imageName || "pbr-material";
    const resolution = resolutionSelect.value;
    const exportProfile = getExportProfile();
    const folder = zip.folder(`${baseName}_${resolution}_${exportProfile.zipSuffix}`);

    for (const [key, canvas] of Object.entries(mapCanvases)) {
      if (!exportProfile.activeMaps.includes(key)) {
        continue;
      }
      const blob = await canvasToBlob(canvas);
      folder.file(getFileName(key), blob);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${baseName}_${resolution}_${exportProfile.zipSuffix}.zip`);
    statusText.textContent = t().statuses.zipStarted;
  } catch (error) {
    console.error(error);
    statusText.textContent = t().statuses.zipFailed;
  } finally {
    downloadAllBtn.disabled = false;
    downloadAllBtn.textContent = t().downloadZip;
  }
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas export failed"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function downloadBlob(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getFileName(mapName) {
  const base = state.imageName || "pbr-material";
  const suffix = `${mapCanvases[mapName].width}x${mapCanvases[mapName].height}`;
  const exportProfile = getExportProfile();
  const profileMap = exportProfile.maps[mapName];
  return `${base}_${profileMap.fileSuffix}_${suffix}.png`;
}

function bindResolutionControls() {
  const syncResolution = (value) => {
    resolutionSelect.value = value;
    refreshSourcePreview();
    markOutputsStale(t().statuses.changedResolution);
  };

  resolutionSelect.addEventListener("change", (event) => {
    syncResolution(event.target.value);
  });
}

function markOutputsStale(message) {
  if (!state.image || Object.keys(state.maps).length === 0) {
    syncOutputPlaceholderSize();
    return;
  }

  clearMapCanvases();
  syncOutputPlaceholderSize();
  state.maps = {};
  downloadAllBtn.disabled = true;
  downloadButtons.forEach((button) => {
    button.disabled = true;
  });
  resultsMeta.textContent = t().statuses.stale;
  statusText.dataset.statusKey = "";
  statusText.textContent = message;
}

function resetResultsMeta() {
  resultsMeta.textContent = t().statuses.emptyResults;
}

function bindExportProfile() {
  exportProfileSelect.addEventListener("change", () => {
    applyExportProfile();

    if (state.image && Object.keys(state.maps).length > 0) {
      const firstCanvas = mapCanvases.albedo;
      updateResultsMeta(materialSelect.value, firstCanvas.width, firstCanvas.height);
    }
  });
}

function applyExportProfile() {
  const exportProfile = getExportProfile();
  Object.entries(mapTitleElements).forEach(([key, element]) => {
    element.textContent = exportProfile.maps[key].title[currentLanguage()];
    mapCardElements[key].style.display = exportProfile.activeMaps.includes(key) ? "" : "none";
  });

  downloadButtons.forEach((button) => {
    const key = button.dataset.download;
    button.disabled = !state.maps[getMapSourceKey(key, exportProfile)] || !exportProfile.activeMaps.includes(key);
  });

  updateMapDescriptions();
  if (Object.keys(state.maps).length > 0) {
    renderMaps();
  }
}

function getExportProfile() {
  return EXPORT_PROFILES[exportProfileSelect.value] || EXPORT_PROFILES.generic;
}

function getMapSourceKey(slotKey, exportProfile = getExportProfile()) {
  return exportProfile.maps[slotKey]?.sourceKey || slotKey;
}

function bindThemeControl() {
  document.body.dataset.theme = themeSelect.value;
  themeSelect.addEventListener("change", () => {
    document.body.dataset.theme = themeSelect.value;
  });
}

function bindLanguageControl() {
  languageSelect.addEventListener("change", () => {
    applyLanguage();
    updateDownloadTooltips();
  });
  applyLanguage();
  updateDownloadTooltips();
}

function updateDownloadTooltips() {
  const label = t().download;
  downloadButtons.forEach((button) => {
    button.title = label;
    button.setAttribute("aria-label", label);
  });
}

function applyLanguage() {
  const lang = t();
  document.documentElement.lang = currentLanguage() === "en" ? "en" : "zh-CN";
  document.title = lang.pageTitle;
  document.querySelector(".hero-copy h1").textContent = lang.heroTitle;
  document.querySelector(".hero-text").textContent = lang.heroText;
  document.querySelector(".hero-select span").textContent = lang.heroLabels.language;
  document.querySelectorAll(".hero-select span")[1].textContent = lang.heroLabels.theme;
  document.querySelectorAll(".stat-card span")[0].textContent = lang.heroLabels.output;
  document.querySelectorAll(".stat-card span")[1].textContent = lang.heroLabels.processing;
  document.querySelectorAll(".stat-card span")[2].textContent = lang.heroLabels.size;
  document.querySelectorAll(".stat-card strong")[0].textContent = lang.heroValues.output;
  document.querySelectorAll(".stat-card strong")[1].textContent = lang.heroValues.processing;
  document.querySelectorAll(".stat-card strong")[2].textContent = lang.heroValues.size;

  document.querySelector(".controls-panel .panel-heading h2").textContent = lang.controlsTitle;
  document.querySelector(".controls-panel .panel-heading p").textContent = lang.controlsText;
  document.querySelector(".source-empty-state .upload-title").textContent = lang.uploadTitle;
  document.querySelector(".source-empty-state .upload-subtitle").textContent = lang.uploadText;
  document.querySelectorAll(".field > span")[0].textContent = lang.resolution;
  document.querySelectorAll(".field > span")[1].textContent = lang.materialType;
  document.querySelectorAll(".field > span")[2].textContent = lang.normalStrength;
  document.querySelectorAll(".field > span")[3].textContent = lang.detailStrength;
  generateBtn.textContent = lang.generate;
  document.querySelectorAll(".tip-item strong")[0].textContent = lang.tipGood;
  document.querySelectorAll(".tip-item strong")[1].textContent = lang.tipResult;
  document.querySelectorAll(".tip-item span")[0].textContent = lang.tipGoodText;
  document.querySelectorAll(".tip-item span")[1].textContent = lang.tipResultText;

  document.querySelector(".source-panel .panel-heading h2").textContent = lang.sourceTitle;
  document.querySelector(".source-panel .panel-heading p").textContent = lang.sourceText;
  document.querySelector(".source-header h3").textContent = lang.sourceInput;
  document.querySelectorAll(".toggle-copy strong")[0].textContent = lang.preserveTitle;
  document.querySelectorAll(".toggle-copy strong")[1].textContent = lang.seamlessTitle;
  document.querySelectorAll(".toggle-copy small")[0].textContent = lang.preserveText;
  document.querySelectorAll(".toggle-copy small")[1].textContent = lang.seamlessText;

  document.querySelector(".results-panel .panel-heading h2").textContent = lang.outputTitle;
  if (Object.keys(state.maps).length === 0) {
    resultsMeta.textContent = state.image ? lang.statuses.emptyResults : lang.statuses.emptyResults;
  } else {
    const firstCanvas = mapCanvases.albedo;
    updateResultsMeta(materialSelect.value, firstCanvas.width, firstCanvas.height);
  }

  document.querySelector(".inline-field span").textContent = lang.exportTarget;
  downloadAllBtn.textContent = downloadAllBtn.textContent === I18N.en.statuses.zipPacking || downloadAllBtn.textContent === I18N.zh.statuses.zipPacking
    ? lang.statuses.zipPacking
    : lang.downloadZip;

  setOptionText(materialSelect, lang.materials);
  Array.from(exportProfileSelect.options).forEach((option) => {
    option.textContent = lang.exportProfiles[option.value];
  });
  themeSelect.options[0].textContent = lang.themes.dark;
  themeSelect.options[1].textContent = lang.themes.light;

  applyExportProfile();

  if (statusText.dataset.statusKey) {
    setStatus(statusText.dataset.statusKey);
  } else if (!statusText.textContent.trim()) {
    setStatus("idle");
  }
}

function setOptionText(selectElement, mapping) {
  Array.from(selectElement.options).forEach((option) => {
    if (mapping[option.value]) {
      option.textContent = mapping[option.value];
    }
  });
}

function mapDescriptionsForKey(key) {
  const order = ["albedo", "height", "normal", "roughness", "ao", "metallic"];
  return mapDescElements[order.indexOf(key)];
}

function updateMapDescriptions() {
  const exportProfile = getExportProfile();
  const lang = currentLanguage();

  Object.keys(mapTitleElements).forEach((slotKey) => {
    const element = mapDescriptionsForKey(slotKey);
    if (!element) {
      return;
    }

    const profileMap = exportProfile.maps[slotKey];
    if (profileMap.description?.[lang]) {
      element.textContent = profileMap.description[lang];
      return;
    }

    const sourceKey = getMapSourceKey(slotKey, exportProfile);
    element.textContent = t().mapDescriptions[sourceKey] || t().mapDescriptions[slotKey] || "";
  });
}

function currentLanguage() {
  return languageSelect.value || "zh";
}

function t() {
  return I18N[currentLanguage()] || I18N.zh;
}

function setStatus(statusKey) {
  statusText.dataset.statusKey = statusKey;
  statusText.textContent = t().statuses[statusKey] || statusText.textContent;
}

function getOutputDimensions(image, resolution, preserveAspect) {
  if (!preserveAspect) {
    return { width: resolution, height: resolution };
  }

  if (image.width >= image.height) {
    return {
      width: resolution,
      height: Math.max(1, Math.round((image.height / image.width) * resolution)),
    };
  }

  return {
    width: Math.max(1, Math.round((image.width / image.height) * resolution)),
    height: resolution,
  };
}

function makeSeamless(imageData) {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);
  const blendX = Math.max(8, Math.floor(width * 0.12));
  const blendY = Math.max(8, Math.floor(height * 0.12));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      let blendWeight = 0;
      let oppositeX = x;
      let oppositeY = y;

      if (x < blendX) {
        blendWeight = Math.max(blendWeight, 1 - x / blendX);
        oppositeX = width - blendX + x;
      } else if (x >= width - blendX) {
        blendWeight = Math.max(blendWeight, 1 - (width - 1 - x) / blendX);
        oppositeX = x - (width - blendX);
      }

      if (y < blendY) {
        blendWeight = Math.max(blendWeight, 1 - y / blendY);
        oppositeY = height - blendY + y;
      } else if (y >= height - blendY) {
        blendWeight = Math.max(blendWeight, 1 - (height - 1 - y) / blendY);
        oppositeY = y - (height - blendY);
      }

      if (blendWeight <= 0) {
        continue;
      }

      const oppositeOffset = (oppositeY * width + oppositeX) * 4;
      const t = clamp(blendWeight * 0.65, 0, 0.65);

      output[offset] = Math.round(data[offset] * (1 - t) + data[oppositeOffset] * t);
      output[offset + 1] = Math.round(data[offset + 1] * (1 - t) + data[oppositeOffset + 1] * t);
      output[offset + 2] = Math.round(data[offset + 2] * (1 - t) + data[oppositeOffset + 2] * t);
      output[offset + 3] = 255;
    }
  }

  return new ImageData(output, width, height);
}

function averageOf(array) {
  let total = 0;
  for (let i = 0; i < array.length; i += 1) {
    total += array[i];
  }
  return total / array.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function mix(a, b, t) {
  return a * (1 - t) + b * t;
}
