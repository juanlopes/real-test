import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

class Folder {
    constructor(name, children){
        this.name = name;
        this.children = children || [];
    }
}

let rootFolder = new Folder('root');
let mainLoop = true;

const rl = readline.createInterface({ input, output });

console.log(`Welcome to the Folder Manager!!`);
console.log(`You can create, list, move and delete folders.`);
console.log(`use the following statements to execute actions:`);
console.log(`CREATE - LIST - MOVE - DELETE`);

while (mainLoop) {
    const answer = await rl.question('What do you want to do? ');

    let action = answer.split(' ')[0];
    let fullPath = answer.split(' ')[1];
    let movePath = answer.split(' ')[2];

    switch (action) {
        case 'CREATE':
            if (fullPath) {
                let path = fullPath.split('/');
                if(path.length <= 1){
                    rootFolder.children.push(new Folder(fullPath, ''))
                } else {
                    manageFolder(path, action);
                }
            }
            break;
        case 'LIST':
            listFolders(rootFolder, 0)
            break;
        case 'MOVE':
            if (fullPath && movePath) {
                let path = fullPath.split('/');
                moveFolder(rootFolder, path, movePath);
            } else {
                console.log('Destination folder cannot be empty')
            }
            break;
        case 'DELETE':
            if (fullPath) {
                let path = fullPath.split('/');
                if(path.length >= 1){
                    manageFolder(path, action, fullPath);
                }
            }
            break;
        case 'EXIT':
            mainLoop = false;
            continue;
        default: console.log('Invalid Option, try again'); continue;
    }
}

rl.close();

function findFolder(mainFolder /* array */, query /* array */, action /* string */, fullQuery){
    if(query.length > 0){
        let index = mainFolder.findIndex(e => e.name == query[0]);
        if(index > -1){
            switch(action){
                case 'CREATE':
                    query.shift();
                    if(mainFolder[index].children.length > 0){
                        return findFolder(mainFolder[index].children, query, action, fullQuery);
                    } else {
                        mainFolder[index].children.push(new Folder(query[0]));
                    }
                    break;
                case 'DELETE':
                    if(query.length == 1){
                        mainFolder.splice(index, 1);
                        return;
                    } else {
                        query.shift();
                        return findFolder(mainFolder[index].children, query, action, fullQuery);
                    }
            }
        } else {
            switch(action){
                case 'CREATE': 
                    mainFolder.push(new Folder(query[0]));
                    break;
                case 'DELETE':
                    console.log('Cannot delete ', fullQuery, ' path not exists')
                    return
            }
        }
    } else {
        return;
    }
}

function manageFolder(totalFolders, action, fullPath){
    findFolder(rootFolder.children, totalFolders, action, fullPath);
} 

function listFolders(folder, identation){
    folder.children.forEach(item => {
        console.log(item.name.padStart(identation + item.name.length, ' '))
        listFolders(item, identation + 1);
    });
}

function moveFolder(folder, path, movePath){
    if(path.length == 1){
        let childrenIndex = folder.children.findIndex(e => e.name == path[0]);
        let childrenToInsert = folder.children.length > 0 ? folder.children[childrenIndex].children : []

        saveFolderAfterMoving(rootFolder, path[0], childrenToInsert, movePath.split('/'))
        folder.children.splice(childrenIndex, 1)
        return;
    }
    let index = folder.children.findIndex(e => e.name == path[0]);
    path.shift()
    moveFolder(folder.children[index], path, movePath)
}

function saveFolderAfterMoving(folder, folderName, children, path){
    if(path.length != 0){
        let index = folder.children.findIndex(e => e.name == path[0]);
        path.shift();
        saveFolderAfterMoving(folder.children[index], folderName, children, path);
    } else {
        folder.children.push(new Folder(folderName, children));
    }
}

/*

CREATE fruits
CREATE vegetables
CREATE grains
CREATE fruits/apples
CREATE fruits/apples/fuji
LIST
CREATE grains/squash
MOVE grains/squash vegetables
CREATE foods
MOVE grains foods
MOVE fruits foods
MOVE vegetables foods
LIST
DELETE fruits/apples
DELETE foods/fruits/apples
LIST

*/