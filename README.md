# VibeCoding 仓库说明

这个仓库用于集中存放多个独立项目。

当前仓库中的项目示例：

- `express-helper-project/`
- `二维码宣传页编辑/`

后续再上传新项目时，统一按“整个项目文件夹”上传，不要把项目内部的子目录拆开后散落到仓库根目录。

## 仓库使用规则

请始终遵循下面这条规则：

- 一个项目对应仓库根目录下的一个完整文件夹
- 上传时保留项目原本的文件夹名称
- 不要只上传 `src/`、`package.json`、`README.md` 这类零散子文件
- 每个项目文件夹内部可以继续保留自己的独立 `README.md`

正确示例：

```text
VibeCoding/
├─ express-helper-project/
├─ 二维码宣传页编辑/
└─ your-next-project/
```

错误示例：

```text
VibeCoding/
├─ src/
├─ package.json
├─ README.md
└─ another-src/
```

## 后续上传新项目的推荐步骤

下面以“把一个新的完整项目文件夹上传到仓库”为例说明。

### 1. 克隆仓库

建议使用 SSH：

```bash
git clone git@github.com:zhang453X/VibeCoding.git
cd VibeCoding
```

### 2. 将整个项目文件夹复制到仓库根目录

假设你准备上传的项目文件夹名为 `my-next-project`，复制完成后结构应当像这样：

```text
VibeCoding/
├─ express-helper-project/
├─ 二维码宣传页编辑/
└─ my-next-project/
```

### 3. 检查是否包含不该上传的内容

每个项目建议至少包含自己的 `.gitignore`，避免上传以下内容：

- `node_modules/`
- `dist/`
- `build/`
- `.cache/`
- `.npm-cache/`
- 临时日志文件
- 本地环境配置中的敏感信息

### 4. 只添加整个项目文件夹

在仓库根目录执行：

```bash
git add my-next-project
```

这样可以明确表示：本次提交上传的是一个完整项目文件夹。

### 5. 提交并推送

```bash
git commit -m "add my-next-project"
git push origin main
```

## 如果你要像这次一样上传整个项目文件夹

核心原则只有一条：

- 上传目标必须是项目的外层目录，而不是项目内部的 `src`、`assets`、`pages` 或其他子目录

例如你本地有：

```text
C:\Projects\demo-app\
```

那么应该上传成：

```text
VibeCoding/
└─ demo-app/
```

而不是：

```text
VibeCoding/
├─ src/
├─ public/
├─ package.json
└─ vite.config.ts
```

## SSH 使用说明

这个仓库建议使用 SSH 连接 GitHub。

当前仓库远端建议使用：

```bash
git remote set-url origin git@github.com:zhang453X/VibeCoding.git
```

### 查看本机公钥

Windows PowerShell：

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

如果你使用的是其他 key 文件，也可以查看对应的 `.pub` 文件，例如：

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519_github_expresshelper.pub
```

### 需要注意的安全规则

- 只能把公钥添加到 GitHub
- 绝对不要把私钥文件上传到仓库
- 不要把 `id_ed25519`、`id_rsa` 这类私钥内容写进 README
- 私钥文件应只保留在本机，例如 `C:\Users\zhang\.ssh\`

## 建议的长期维护方式

后续每新增一个项目，建议都按下面的方式维护：

1. 在仓库根目录新增一个完整项目文件夹
2. 在该项目文件夹内部保留它自己的 `README.md`
3. 在本仓库根 README 中补一条项目目录说明
4. 提交前先检查是否误传缓存、构建产物和敏感文件

## 当前仓库结构示例

```text
VibeCoding/
├─ README.md
├─ .gitignore
├─ express-helper-project/
└─ 二维码宣传页编辑/
```
