<br/>
<p align="center">
  <a href="https://scbots.gitbook.io/surviecraft/" target="_blank">
    <img src="images/logo.png" alt="Logo" width="120" height="120">
  </a>

  <h1 align="center">SurvieCraft Bot V3</h1>

  <p align="center">
    SurvieCraft Bot est un bot Discord multifonctions privé appartenant au serveur Minecraft SurvieCraft
   </p>
</p>

[![license - MIT](https://img.shields.io/badge/license-MIT-green?logo=github&logoColor=white)](https://choosealicense.com/licenses/mit/)

[![langage - javascript](https://img.shields.io/badge/langage-javascript-yellow?logo=javascript&logoColor=white)](https://www.javascript.com/)

[![dependency - discord.js](https://img.shields.io/badge/dependency-discord.js-blue?logo=discord&logoColor=white)](https://discord.js.org/)

## Table Of Contents

- [Installation](#installation)
- [Starting App](#starting-app)
- [Documentation](#documentation)
- [Authors](#authors)
- [License](#license)

## Installation

```bash
  apt update -y && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && apt install -y nodejs git

  git clone https://github.com/Simon-Fontaine/surviecraft-v3.git
  cd surviecraft-v3

  npm i
```

Créez un fichier nommé `token.json` dans la racine du dossier surviecraft-v3 avec les informations ci-dessous, n'oubliez pas de mettre les bonnes valeurs

```json
{
  "token": "REPLACE_HERE",
  "devID": "REPLACE_HERE",
  "mongoURI": "REPLACE_HERE"
}
```

## Starting App

Pour démarrer l'application, exécutez la commande suivante dans sons dossier

```bash
  node index.js
```

## Documentation

Une documentation complète du bot discord peut être trouvée [juste ici](https://scbots.gitbook.io/surviecraft/) (outdated)

## Authors

- [@Simon-Fontaine](https://github.com/Simon-Fontaine)

## License

[MIT](https://choosealicense.com/licenses/mit/)
