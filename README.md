
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/dudor/BookmarkHub">
    <img src="images/icon128.png" alt="BookmarkHub" >
  </a>

  <h1 align="center">BookmarkHub</h1>
  <p align="center">
    BookmarkHub is a browser plug-in that can synchronize your bookmarks between different browsers.
    <br />
    <a href="https://github.com/dudor/BookmarkHub/issues">Feedback</a>
    ·
    <a href="/README_cn.md">简体中文</a>
    ·
    <a href="/README.md">English</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project 

BookmarkHub is a browser plug-in that can synchronize your bookmarks between different browsers.

For major browsers such as Chrome, Firefox, Microsoft Edge, and more.

It uses GitHub's Gist records to store browser bookmarks for safe and secure use.

![BookmarkHub](images/3.gif)

![BookmarkHub](images/1.png)

![BookmarkHub](images/2.png)

## Features
* **Multi-Gist Support**: Configure multiple GitHub Gist or Gitee Gist configurations
* **Easy Management**: Add, edit, delete, and activate different Gist configurations
* **Cross-Platform**: Support for both GitHub and Gitee platforms
* **No Registration Required**: Just use the Token and Gist of your GitHub/Gitee account
* **One-Click Sync**: Easy to upload and download bookmarks with one click
* **Clear All**: Clear all local bookmarks with one click
* **Cross-Platform Sync**: Support cross-machine and cross-browser synchronization of bookmarks
* **Bookmark Counter**: Support to display the number of local and remote bookmarks
* **Modern UI**: Beautiful and intuitive user interface with smooth animations


## Installation
> This plug-in requires bookmarks to be stored in Gist, so make sure you have a GitHub account or register your GitHub account over the network.
* [Chrome](https://chrome.google.com/webstore/detail/bookmarkhub-sync-bookmark/fohimdklhhcpcnpmmichieidclgfdmol)
* [Firefox](https://addons.mozilla.org/en/firefox/addon/BookmarkHub/)
* [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/BookmarkHub/fdnmfpogadcljhecfhdikdecbkggfmgk)
* [Other browsers based on the Chromium kernel](https://chrome.google.com/webstore/detail/bookmarkhub-sync-bookmark/fohimdklhhcpcnpmmichieidclgfdmol)

<!-- USAGE EXAMPLES -->
## Usage

### Basic Setup

1. [Login](https://github.com/login) GitHub，If you don't have an account, please [click here to register](https://github.com/join)。
2. [Create a token that manages the gist](https://github.com/settings/tokens/new)。
3. [Create a secret gist](https://gist.github.com)。__Note: If it's a public gist, your bookmarks can be searched by others。__
4. Download BookmarkHub in the browser store, click the plug-in's settings button, fill in the token and gist ID in the pop-up settings window, and you can upload the download bookmark。

### Multi-Gist Configuration

#### Setting Up Multiple Configurations

1. **Open Options Page**: Click the extension icon and select "Settings"
2. **Choose Platform**: Switch between GitHub and Gitee tabs
3. **Add Configuration**: Click "Add New Configuration" button
4. **Configure Settings**:
   - **Name**: Give your configuration a descriptive name
   - **Token**: Your GitHub/Gitee personal access token
   - **Gist ID**: The ID of your Gist
   - **File Name**: Name of the file in your Gist (default: BookmarkHub)
   - **Enable Notify**: Toggle notifications for this configuration
5. **Activate**: Click "Activate" to make this configuration active

#### Managing Configurations

- **Switch Active**: Click "Activate" on any configuration to make it the active one
- **Edit**: Modify any field in the configuration form - changes are saved automatically
- **Delete**: Remove configurations you no longer need (at least one configuration must remain)
- **Add More**: Create unlimited configurations for different purposes

#### Getting Tokens

- **GitHub**: Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens/new)
- **Gitee**: Go to [Gitee Personal Access Tokens](https://gitee.com/personal_access_tokens)

## New Features in Latest Version

### 🎨 Enhanced UI/UX
- Modern gradient design with smooth animations
- Improved form styling with better visual feedback
- Responsive design that works on different screen sizes
- Card-based layout with hover effects

### 🔧 Multi-Gist Configuration
- **Multiple Configurations**: Add unlimited GitHub Gist or Gitee Gist configurations
- **Easy Switching**: Activate different configurations with one click
- **Individual Settings**: Each configuration has its own token, Gist ID, file name, and notification settings
- **Smart Management**: Delete configurations safely with automatic fallback to the first available configuration

### 🚀 Improved Storage
- **Structured Data**: New storage format supporting multiple configurations
- **Backward Compatibility**: Automatic migration from old single-configuration format
- **Better Organization**: Separate storage for GitHub and Gitee configurations

<!-- ROADMAP -->
## Roadmap

- [ ] Automatically sync bookmarks
- [ ] Support webdav protocol
- [ ] Mobile app
- [ ] Import and Export
- [ ] Share bookmarks

<!-- LICENSE -->
## License

See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

dudor

Project Link: [https://github.com/dudor/BookmarkHub](https://github.com/dudor/BookmarkHub)



