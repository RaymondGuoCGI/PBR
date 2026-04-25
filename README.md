# PBR 材质生成器

一个纯前端单页工具，用单张材质图片快速推断并生成常见 PBR 通道贴图：

- `Base Color`
- `Height`
- `Normal`
- `Roughness`
- `Ambient Occlusion`
- `Metallic`

## 使用方式

直接在当前目录启动一个静态文件服务即可，例如：

```powershell
python -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

## 部署到 `pbr.raymondstudio.cn`

当前目录已经补好了 GitHub Pages 所需文件：

- `CNAME`
- `.nojekyll`
- `.github/workflows/deploy-pages.yml`

如果你准备把这个站部署到 GitHub Pages，按下面做：

1. 把当前目录推到一个 GitHub 仓库，并使用 `main` 分支。
2. 在 GitHub 仓库里进入 `Settings -> Pages`。
3. 确认来源使用 GitHub Actions。
4. 在你的 DNS 服务商后台添加一条 `CNAME` 记录：

```text
主机记录: pbr
记录类型: CNAME
记录值: <你的 GitHub Pages 站点地址>
```

通常这个值会是：

```text
<你的 GitHub 用户名>.github.io
```

5. 等待 DNS 生效后，在 GitHub Pages 中确认自定义域名为：

```text
pbr.raymondstudio.cn
```

6. 启用 HTTPS。

## 当前实现说明

- 所有图片处理都在浏览器本地完成，不依赖后端。
- 支持选择输出分辨率：`512 / 1024 / 2048 / 4096`。
- 支持选择材质倾向：自动、水泥/石材、木材、布料、塑料、金属。
- 当前算法是基于单张图片的启发式推断，适合快速打样，不是基于摄影测量或 AI 训练模型的高精度扫描结果。

## 更高质量的下一步

如果你要把它做成更接近商用品质的版本，建议继续加：

- 后端任务队列，避免浏览器直接处理超大图时卡顿
- WebGL/WebGPU 或 WASM 加速
- AI 模型推断不同材质类型和更稳定的通道分离
- 平铺去接缝处理
- 批量导出 ZIP
- 三维球体或平面实时预览
