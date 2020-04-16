function expandFolder(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var folderId = buttonElement.parent().attr("folderId");
    var nestedFolderList = $(`#${getNestedFoldersListId(folderId)}`);

    if (buttonElement.hasClass("folder-unopened")) {
        if (nestedFolderList.length) {
            // if the nested folders have already been retrieved
            // just reveal them
            nestedFolderList.show();
        } else {
            // otherwise, request all subfolders and files
            createNestedFolderList(folderId);
            requestSubFolders(folderId);
            requestFiles(folderId);
        }

        buttonElement.text("-");
        buttonElement.removeClass("folder-unopened");
        buttonElement.addClass("folder-opened");
    } else if (buttonElement.hasClass("folder-opened")) {
        nestedFolderList.hide();

        buttonElement.text("+");
        buttonElement.removeClass("folder-opened");
        buttonElement.addClass("folder-unopened");
    }
}

function newFolderButtonEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderForm =
        `<div>
            <input type="text" name="name" placeholder="New Folder"/>
            <button onclick="addFolderEvent(this)" type="Button">Add</button>
            <button onclick="cancelAddFolderEvent(this)" type="Button">Cancel</button>
         </div>`;

    // disable 'New Folder' button
    buttonElement.hide();

    buttonElement.parent().append(newFolderForm);
}

function addFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderButton = buttonElement.parent().parent().find(".new-folder-btn");
    var newFolderFields = buttonElement.parent();
    var requestUrl = "/fileshare/create-sub-folder";
    var parentFolderId = parseInt(buttonElement.parent().parent().parent().parent().attr("folderId"));
    var folderName = newFolderFields.find("input:first-child").val();
    var parameters = { parentFolderId: parentFolderId, folderName: folderName };

    $.post(requestUrl, parameters, function(data) {
        // reload subfolders and files from the backed
        if (data["success"]) {
            createNestedFolderList(parentFolderId);
            requestSubFolders(parentFolderId);
            requestFiles(parentFolderId);
        }
    });
}

function cancelAddFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderButton = buttonElement.parent().parent().find(".new-folder-btn");
    var newFolderFields = buttonElement.parent();

    // enable 'New Folder' button
    newFolderButton.show();

    // remove new folder field and buttons
    newFolderFields.remove();
}

function renameFolderButtonEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var folderName = buttonElement.parent().find("> span.folder-name").text();
    var deleteFolderButton = buttonElement.parent().find("> .folder-delete-btn");
    var moveFolderButton = buttonElement.parent().find("> .folder-move-btn");
    var renameFolderForm =
        `<span>
            <input type="text" name="name" placeholder="${folderName.replace('/', '')}"/>
            <button onclick="confirmRenameFolderEvent(this)" type="Button">Confirm</button>
            <button onclick="cancelRenameFolderEvent(this)" type="Button">Cancel</button>
         </span>`;

    // Disable 'Rename', 'Delete' and 'Move' buttons
    buttonElement.hide();
    deleteFolderButton.hide();
    moveFolderButton.hide();

    deleteFolderButton.before(renameFolderForm);
}

function confirmRenameFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var folderContainer = buttonElement.parent().parent();
    var newFolderName = buttonElement.parent().find("input:first-child").val();
    var folderId = parseInt(folderContainer .attr("folderId"));
    var requestUrl = "/fileshare/rename-folder";
    var parameters = { folderId: folderId, newFolderName: newFolderName };
    var moveFolderButton = buttonElement.parent().parent().find("> .folder-move-btn");

    $.ajax({
        url: requestUrl,
        type: "PATCH",
        data: parameters,
        success: function(data) {
            if (data["success"]) {
                var folderNameContainer = folderContainer.find("> span.folder-name");
                folderNameContainer.text(newFolderName + "/");
            }
        }
    });

    // Enable 'Move' button
    moveFolderButton.show();

    removeRenameFolderFields(buttonElement);
}

function cancelRenameFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var moveFolderButton = buttonElement.parent().parent().find("> .folder-move-btn");

    // Enable 'Move' button
    moveFolderButton.show();

    removeRenameFolderFields(buttonElement);
}

function removeRenameFolderFields(buttonElement) {
    var renameFolderButton = buttonElement.parent().parent().find("> .folder-rename-btn");
    var deleteFolderButton = buttonElement.parent().parent().find("> .folder-delete-btn");
    var renameFolderFields = buttonElement.parent();

    // enable 'Rename' and 'Delete' buttons
    renameFolderButton.show();
    deleteFolderButton.show();

    // remove rename folder field and buttons
    renameFolderFields.remove();
}

function deleteFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var parentContainer = buttonElement.parent();
    var folderName = parentContainer.find("> span.folder-name").text();

    if (confirm(`Are you sure you want to delete folder "${folderName.replace('/', '')}"`)) {
        var requestUrl = "/fileshare/delete-folder";
        var parameters = { folderId: parseInt(parentContainer.attr("folderId")) };

        $.ajax({
            url: requestUrl,
            type: "DELETE",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    parentContainer.remove();
                    alert(`Folder "${folderName.replace('/', '')}" has been successfully deleted`);
                } else {
                    alert("Error: unable to delete folder");
                }
            }
        });
    }
}

function moveFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var folderId = buttonElement.parent().attr("folderId");
    var placeFolderButtons = $(`:not([folderId=${folderId}])`).find("> .folder-place-btn");
    var moveFolderButtons = $(".folder-move-btn");
    var cancelPlaceFolderButton = `<button onclick="cancelPlaceFolderEvent(this)" class="folder-cancel-place-btn" type="button">Cancel</button>`;
    var renameFolderButtons = $(".folder-rename-btn");
    var deleteFolderButtons = $(".folder-delete-btn");

    // Enable "Place" buttons
    placeFolderButtons.show();
    // Disable "Move", "Delete" and "Rename" buttons
    moveFolderButtons.hide();
    renameFolderButtons.hide();
    deleteFolderButtons.hide();

    // Add a "Cancel" button to cancel move operation
    buttonElement.parent().find("> span.folder-name").after(cancelPlaceFolderButton);

    window.gCurrentlyMovingFolder = folderId;
}

function placeFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var folderId = parseInt(buttonElement.parent().attr("folderId"));
    var nestedFoldersListId = getNestedFoldersListId(folderId);
    var placeFolderButtons = $(".folder-place-btn");
    var moveFolderButtons = $(".folder-move-btn");
    var cancelPlaceFolderButton = $(".folder-cancel-place-btn");
    var movedFolderContainer = $(`[folderId="${window.gCurrentlyMovingFolder}"]`);
    var requestUrl = "/fileshare/move-folder";
    var parameters = { folderId: window.gCurrentlyMovingFolder, newParentId: folderId };
    var renameFolderButtons = $(".folder-rename-btn");
    var deleteFolderButtons = $(".folder-delete-btn");

    if (confirm("Are you sure you wish to place this folder here?")) {
        $.ajax({
            url: requestUrl,
            type: "PATCH",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    if ($(`#${nestedFoldersListId}`).length) {
                        // if the nested folders have already been retrieved
                        // move the moved folder's container to the nested folders' container
                        movedFolderContainer.appendTo(`#${nestedFoldersListId}`);
                    } else {
                        // otherwise, delete the moved folder's container
                        movedFolderContainer.remove();
                    }
                } else {
                    alert("Error: unable to move folder");
                }
            }
        });

        // Disable "Place" buttons
        placeFolderButtons.hide();
        // Enable "Move", "Rename" and "Delete" buttons
        moveFolderButtons.show();
        renameFolderButtons.show();
        deleteFolderButtons.show();
        // Remove "Cancel" place button
        cancelPlaceFolderButton.remove();

        window.gCurrentlyMovingFolder = 0;
    }
}

function cancelPlaceFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var placeFolderButtons = $(".folder-place-btn");
    var moveFolderButtons = $(".folder-move-btn");
    var renameFolderButtons = $(".folder-rename-btn");
    var deleteFolderButtons = $(".folder-delete-btn");

    // Disable "Place" buttons
    placeFolderButtons.hide();
    // Enable "Move", "Rename" and "Delete" buttons
    moveFolderButtons.show();
    renameFolderButtons.show();
    deleteFolderButtons.show();
    // Remove "Cancel" place button
    buttonElement.remove();  // self-destruct

    window.gCurrentlyMovingFolder = 0;
}

function renameFileButtonEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileName = buttonElement.parent().find("> span.file-name").text();
    var deleteFileButton = buttonElement.parent().find("> .file-delete-btn");
    var renameFileForm =
        `<span>
            <input type="text" name="name" placeholder="${fileName}"/>
            <button onclick="confirmRenameFileEvent(this)" type="Button">Confirm</button>
            <button onclick="cancelRenameFileEvent(this)" type="Button">Cancel</button>
         </span>`;

    // Disable 'Rename', 'Delete' and 'Move' buttons
    buttonElement.hide();
    deleteFileButton.hide();

    buttonElement.after(renameFileForm);
}

function confirmRenameFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileContainer = buttonElement.parent().parent();
    var newFileName = buttonElement.parent().find("input:first-child").val();
    var fileId = parseInt(fileContainer.attr("fileId"));
    var requestUrl = "/fileshare/rename-file";
    var parameters = { fileId: fileId, newFileName: newFileName };

    $.ajax({
        url: requestUrl,
        type: "PATCH",
        data: parameters,
        success: function(data) {
            if (data["success"]) {
                fileContainer.find("> span.file-name").text(newFileName);
            }
        }
    });

    removeRenameFileFields(buttonElement);
}

function cancelRenameFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);

    removeRenameFileFields(buttonElement);
}

function removeRenameFileFields(buttonElement) {
    var renameFileButton = buttonElement.parent().parent().find("> .file-rename-btn");
    var deleteFileButton = buttonElement.parent().parent().find("> .file-delete-btn");
    var renameFileFields = buttonElement.parent();

    // enable 'Rename' and 'Delete' buttons
    renameFileButton.show();
    deleteFileButton.show();

    // remove rename folder field and buttons
    renameFileFields.remove();
}

function deleteFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var parentContainer = buttonElement.parent();
    var fileName = parentContainer.find("> span.file-name").text();

    if (confirm(`Are you sure you want to delete file "${fileName}"`)) {
        var requestUrl = "/fileshare/delete-file";
        var parameters = { fileId: parseInt(parentContainer.attr("fileId")) };

        $.ajax({
            url: requestUrl,
            type: "DELETE",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    parentContainer.remove();
                    alert(`File "${fileName}" has been successfully deleted`);
                } else {
                    alert("Error: unable to delete file");
                }
            }
        });
    }
}

function createNestedFolderList(folderId) {
    var parentFolder = $("#root-folder-container").find(`[folderId="${folderId}"]`);
    var nestedFoldersListId = getNestedFoldersListId(folderId);
    var folderList =
        `<ul id="${nestedFoldersListId}">\n
            <li>\n
                <button onclick="newFolderButtonEvent(this)" class="new-folder-btn" type="button">New Folder</button>\n
            </li>\n
        </ul>`;

    $(`#${nestedFoldersListId}`).remove();
    parentFolder.append(folderList);
}

function requestSubFolders(parentFolderId) {
    var requestUrl = "/fileshare/get-sub-folder?parentFolderId=" + parentFolderId;

    $.get(requestUrl, function(data) {
        var nestedFolderList = $(`#${getNestedFoldersListId(parentFolderId)}`);

        // add the list of sub folders
        Object.entries(data).forEach(([id, name]) => {
            nestedFolderList.append(
                `<li folderId="${id}">\n
                    <button onclick="expandFolder(this)" class="folder-expand folder-unopened" type="button">+</button>\n
                    <span class="folder-name">${name}/</span>\n
                    <button onclick="renameFolderButtonEvent(this)" class="folder-rename-btn" type="button">Rename</button>
                    <button onclick="deleteFolderEvent(this)" class="folder-delete-btn" type="button">Delete</button>
                    <button onclick="moveFolderEvent(this)" class="folder-move-btn" type="button">Move</button>
                    <button onclick="placeFolderEvent(this)" class="folder-place-btn" type="button">Place</button>
                 </li>\n`
            );
        });

        // Hide/Show 'Move/Place' buttons
        var moveFolderButtons = nestedFolderList.find(".folder-move-btn");
        var placeFolderButtons = nestedFolderList.find(".folder-place-btn");
        if (window.gCurrentlyMovingFolder) {
            moveFolderButtons.hide();
            placeFolderButtons.show();
        } else {
            moveFolderButtons.show();
            placeFolderButtons.hide();
        }
    });
}

function requestFiles(folderId) {
    var requestUrl = "/fileshare/get-files?folderId=" + folderId;

    $.get(requestUrl, function(data) {
        var nestedFolderList = $(`#${getNestedFoldersListId(folderId)}`);

        // add the list of files
        Object.entries(data).forEach(([id, name]) => {
            nestedFolderList.append(
                `<li fileId="${id}">\n
                    <span class="file-name">${name}</span>
                    <button onclick="renameFileButtonEvent(this)" class="file-rename-btn" type="button">Rename</button>
                    <button onclick="deleteFileEvent(this)" class="file-delete-btn" type="button">Delete</button>
                 </li>\n`
            );
        });
    });
}

function getNestedFoldersListId(parentFolderId) {
    return `nested-folders-of-${parentFolderId}`;
}

$(document).ready(function() {
    // Global variables
    window.gCurrentlyMovingFolder = 0;

    // setup CSRF for AJAX POST request
    var token = $("meta[name='_csrf']").attr("content");
    var header = $("meta[name='_csrf_header']").attr("content");
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader(header, token);
    });
});
