# Reverse Engineering Task

## Requirements

* NodeJS
* A Node package manager 
    > NPM is packaged with the NodeJS installer, alternativitly use Yarn.

## Getting Started

### Installation
1. run `npm ci` (or `yarn install`)
2. run `npm build`


### Usage
```
$ node src/index.ts -u user1.txt user2.txt -m menu1.txt menu2.txt
```
```
$ node src/index.ts --files user1.txt menu1.txt
```

```
$ node src/index.ts -u user1.txt -m menu1.txt
```
```
$ node src/index.ts user1.txt menu1.txt
```
```
$ node src/index.ts -h
```
