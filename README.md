# static-html-seed

静态页面模板，支持 TypeScript、SCSS 以及 EJS。

## 项目结构

- src
    - assets
    - common
    - layout
    - pages
    
- dist

### assets 

用于资源存放，例如 jpg/png/gif 等图片资源存放

### common

通用资源存放，非静态资源等通用组件、样式、模块等存放

### layout

布局模块，如公用顶部栏、底部栏等区域存放

### pages

核心页面目录，此目录下的所有`ejs`文件，均会被自动导入到处理队列中进行转换，

并且提供给`guide`处理器，进行生成出导航页。

导航页面的生成，会以目录结构进行分组。
