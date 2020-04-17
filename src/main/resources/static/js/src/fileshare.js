function expandFolder(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var folderId = buttonElement.parent().attr("fileId");
    var nestedFilesList = $(`#${getNestedFilesListId(folderId)}`);

    if (buttonElement.hasClass("folder-unopened")) {
        if (nestedFilesList.length) {
            // if the files folders have already been retrieved
            // just reveal them
            nestedFilesList.show();
        } else {
            // otherwise, request all subfiles
            requestSubFiles(folderId);
        }

        buttonElement.text("-");
        buttonElement.removeClass("folder-unopened");
        buttonElement.addClass("folder-opened");
    } else if (buttonElement.hasClass("folder-opened")) {
        nestedFilesList.hide();

        buttonElement.text("+");
        buttonElement.removeClass("folder-opened");
        buttonElement.addClass("folder-unopened");
    }
}

function newFolderButtonEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderForm =
        `<span>
            <input class="new-file-name" type="text" name="name" placeholder="New Folder"/>
            <button onclick="addFolderEvent(this)" type="Button">Add</button>
            <button onclick="cancelAddFolderEvent(this)" type="Button">Cancel</button>
         </span>`;

    // disable 'New Folder' button
    buttonElement.hide();

    buttonElement.after(newFolderForm);
}

function addFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderButton = buttonElement.parent().parent().find("> .new-folder-btn");
    var newFolderFields = buttonElement.parent();
    var parentFolderId = parseInt(buttonElement.parent().parent().parent().parent().attr("fileId"));
    var folderName = newFolderFields.find("input.new-file-name").val();
    var requestUrl = "/fileshare/create-sub-folder";
    var parameters = { parentFolderId: parentFolderId, folderName: folderName };

    $.post(requestUrl, parameters, function(data) {
        // reload subfolders and files from the backed
        if (data["success"]) {
            var nestedFilesList = $(`#${getNestedFilesListId(parentFolderId)}`);
            nestedFilesList.remove();
            requestSubFiles(parentFolderId);
        } else {
            alert("Error: unable to create new folders")
        }
    });
}

function cancelAddFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderButton = buttonElement.parent().parent().find("> .new-folder-btn");
    var newFolderFields = buttonElement.parent();

    // enable 'New Folder' button
    newFolderButton.show();

    // remove new folder field and buttons
    newFolderFields.remove();
}

function uploadFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var file = buttonElement.parent().find("> input.file-input").prop("files")[0];

    if (file == undefined) {
        alert("Please choose a file before attempting to upload");
    } else {
        var parentFolderId = parseInt(buttonElement.parent().parent().parent().parent().attr("fileId"));
        var requestUrl = "/fileshare/upload-file";
        var formData = new FormData();
        formData.append("file", file);
        formData.append("parentFolderId", parentFolderId)

        $.ajax({
            url: requestUrl,
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function(data) {
                if (data["success"]) {
                    var nestedFilesList = $(`#${getNestedFilesListId(parentFolderId)}`);
                    nestedFilesList.remove();
                    requestSubFiles(parentFolderId);
                } else {
                    alert("Error: couldn't upload file")
                }
            }
        });
    }
}

function renameFileButtonEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileNameContainer = buttonElement.parent().find("> span.file-name");
    var fileName = fileNameContainer.text();
    var deleteFileButton = buttonElement.parent().find("> .file-delete-btn");
    var renameFileForm =
        `<span>
            <input class="new-file-name" type="text" name="name" placeholder="${fileName.replace('/', '')}"/>
            <button onclick="confirmRenameFileEvent(this)" type="Button">Confirm</button>
            <button onclick="cancelRenameFileEvent(this)" type="Button">Cancel</button>
         </span>`;

    // Disable 'Rename', 'Delete' buttons
    buttonElement.hide();
    deleteFileButton.hide();

    fileNameContainer.after(renameFileForm);
}

function confirmRenameFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileContainer = buttonElement.parent().parent();
    var fileId = parseInt(fileContainer.attr("fileId"));
    var newFileName = buttonElement.parent().find("input.new-file-name").val();
    var requestUrl = "/fileshare/rename-file";
    var parameters = { fileId: fileId, newFileName: newFileName };

    $.ajax({
        url: requestUrl,
        type: "PATCH",
        data: parameters,
        success: function(data) {
            if (data["success"]) {
                if (fileContainer.attr("fileType") == "D") {
                    newFileName += "/";
                }
                fileContainer.find("> span.file-name").text(newFileName);
            } else {
                alert("Error: unable to ")
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
    var fileName = buttonElement.parent().find("> span.file-name").text();

    if (confirm(`Are you sure you want to delete "${fileName}"`)) {
        var requestUrl = "/fileshare/delete-file";
        var parameters = { fileId: parseInt(buttonElement.parent().attr("fileId")) };

        $.ajax({
            url: requestUrl,
            type: "DELETE",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    buttonElement.parent().remove();
                    alert(`"${fileName}" has been successfully deleted`);
                } else {
                    alert("Error: unable to delete folder");
                }
            }
        });
    }
}

function moveFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileId = buttonElement.parent().attr("fileId");
    var cancelPlaceFileButton = `<button onclick="cancelPlaceFileEvent(this)" class="file-cancel-place-btn" type="button">Cancel</button>`;

    window.gCurrentlyMovingFile = fileId;
    duringMoveState();
    // Add a "Cancel" button to cancel move operation
    buttonElement.parent().find("> span.file-name").after(cancelPlaceFileButton);
}

function placeFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newParentId = parseInt(buttonElement.parent().attr("fileId"));
    var requestUrl = "/fileshare/move-file";
    var parameters = { fileId: window.gCurrentlyMovingFile, newParentId: newParentId };

    if (confirm("Are you sure you wish to place this file here?")) {
        var movedFileContainer = $(`[fileId="${window.gCurrentlyMovingFile}"]`);

        $.ajax({
            url: requestUrl,
            type: "PATCH",
            data: parameters,
            success: function(data) {
                var nestedFilesList = $(`#${getNestedFilesListId(newParentId)}`);

                if (data["success"]) {
                    if (nestedFilesList.length) {
                        // if the nested files have already been retrieved
                        // move the moved file's container to the nested files' container
                        movedFileContainer.appendTo(nestedFilesList);
                    } else {
                        // otherwise, delete the moved file's container
                        movedFileContainer.remove();
                    }
                } else {
                    alert("Error: unable to move folder");
                }
            }
        });

        nonMoveState();
        window.gCurrentlyMovingFile = 0;
    }
}

function cancelPlaceFileEvent(buttonDOM) {
    nonMoveState();
    window.gCurrentlyMovingFile = 0;
}

function duringMoveState() {
    var placeFileButtons = $(`:not([fileId=${window.gCurrentlyMovingFile}])`).find("> .file-place-btn");
    var moveFileButtons = $(".file-move-btn");
    var renameFileButtons = $(".file-rename-btn");
    var deleteFileButtons = $(".file-delete-btn");
    var newFolderButtons = $(".new-folder-btn");
    var uploadFileButtons = $(".upload-file-btn");

    // Enable "Place" buttons
    placeFileButtons.show();
    // Disable "Move", "Delete" and "Rename" buttons
    moveFileButtons.hide();
    renameFileButtons.hide();
    deleteFileButtons.hide();
    newFolderButtons.prop("disabled", true);
    uploadFileButtons.parent().children().prop("disabled", true);
}

function nonMoveState() {
    var placeFileButtons = $(".file-place-btn");
    var moveFileButtons = $(".file-move-btn");
    var renameFileButtons = $(".file-rename-btn");
    var deleteFileButtons = $(".file-delete-btn");
    var cancelPlaceFileButton = $(".file-cancel-place-btn");
    var newFolderButtons = $(".new-folder-btn");
    var uploadFileButtons = $(".upload-file-btn");

    // Disable "Place" buttons
    placeFileButtons.hide();
    // Enable "Move", "Rename", "Delete", "New Folder" and "Upload File" buttons
    moveFileButtons.show();
    renameFileButtons.show();
    deleteFileButtons.show();
    newFolderButtons.prop("disabled", false);
    uploadFileButtons.parent().children().prop("disabled", false);
    // Remove "Cancel" place button
    cancelPlaceFileButton.remove();
}

/*
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

function moveFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileId = buttonElement.parent().attr("fileId");
    var folderId = buttonElement.parent().parent().parent().attr("folderId");
    var moveButtons = $(".folder-move-btn,.file-move-btn");
    var renameButtons = $(".folder-rename-btn,.file-rename-btn");
    var deleteButtons = $(".folder-delete-btn,.file-delete-btn");
    var placeFileButtons = $(`:not([fileId=${fileId}])`).find("> .file-place-btn");
    var placeFolderButtons = $(".folder-place-btn")
    var cancelPlaceFileButton = `<button onclick="cancelPlaceFileEvent(this)" class="file-cancel-place-btn" type="button">Cancel</button>`;

    // Enable "Place" buttons
    placeFileButtons.show();
    // Disable "Move", "Delete" and "Rename" buttons, as well as folder "Place" buttons
    moveButtons.hide();
    renameButtons.hide();
    deleteButtons.hide();
    placeFolderButtons.hide();

    // Add a "Cancel" button to cancel move operation
    buttonElement.parent().find("> span.file-name").after(cancelPlaceFileButton);

    window.gCurrentlyMovingFile = fileId;
}

function placeFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileId = parseInt(buttonElement.parent().attr("fileId"));
    var nestedFilesListId = getNestedFilesListId(fileId);
    var placeFileButtons = $(".file-place-btn");
    var moveFileButtons = $(".file-move-btn");
    var cancelPlaceFileButton = $(".file-cancel-place-btn");
    var movedFileContainer = $(`[fileId="${window.gCurrentlyMovingFile}"]`);
    var requestUrl = "/fileshare/move-file";
    var parameters = { fileId: window.gCurrentlyMovingFile, newParentId: fileId };
    var renameFileButtons = $(".file-rename-btn");
    var deleteFileButtons = $(".file-delete-btn");

    if (confirm("Are you sure you wish to place this file here?")) {
        $.ajax({
            url: requestUrl,
            type: "PATCH",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    if ($(`#${nestedFilesListId}`).length) {
                        // if the nested files have already been retrieved
                        // move the moved file's container to the nested files' container
                        movedFileContainer.appendTo(`#${nestedFilesListId}`);
                    } else {
                        // otherwise, delete the moved file's container
                        movedFileContainer.remove();
                    }
                } else {
                    alert("Error: unable to move file");
                }
            }
        });

        // Disable "Place" buttons
        placeFileButtons.hide();
        // Enable "Move", "Rename" and "Delete" buttons
        moveFileButtons.show();
        renameFileButtons.show();
        deleteFileButtons.show();
        // Remove "Cancel" place button
        cancelPlaceFileButton.remove();

        window.gCurrentlyMovingFile = 0;
    }
}

function cancelPlaceFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var moveButtons = $(".folder-move-btn,.file-move-btn");
    var renameButtons = $(".folder-rename-btn,.file-rename-btn");
    var deleteButtons = $(".folder-delete-btn,.file-delete-btn");
    var placeButtons = $(".folder-place-btn,.file-place-btn");

    // Disable "Place" buttons
    placeButtons.hide();
    // Enable "Move", "Rename" and "Delete" buttons
    moveButtons.show();
    renameButtons.show();
    deleteButtons.show();
    // Remove "Cancel" place button
    buttonElement.remove();  // self-destruct

    window.gCurrentlyMovingFile = 0;
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
*/

function requestSubFiles(parentFolderId) {
    var requestUrl = "/fileshare/get-sub-files?parentFolderId=" + parentFolderId;

    $.get(requestUrl, function(data) {
        // Add nested files list
        var parentFolder = $("#root-folder-container").find(`[fileId="${parentFolderId}"]`);
        var nestedFilesListId = getNestedFilesListId(parentFolderId);
        var folderList =
            `<ul id="${nestedFilesListId}">\n
                <li>\n
                    <button onclick="newFolderButtonEvent(this)" class="new-folder-btn" type="button">New Folder</button>\n
                </li>\n
                <li>\n
                    <form method="POST" action="/fileshare/upload-file" enctype="multipart/form-data">\n
                        <button onclick="uploadFileEvent(this)" class="upload-file-btn" type="button">Upload</button>\n
                        <input class="file-input" type="file" name="file"/>\n
                    </form>\n
                </li>\n
            </ul>`;
        parentFolder.append(folderList);

        // Fill nested files list with file entries
        var nestedFilesList = $(`#${nestedFilesListId}`);

        if (!jQuery.isEmptyObject(data)) {
            data.sort(function(a, b) {
                // show directories at the top of the list, then normal files
                var aValue = a['fileType'] == "FILE" ? 0 : 1;
                var bValue = b['fileType'] == "FILE" ? 0 : 1;
                return bValue - aValue;
            });
            $.each(data, function(index, file) {
                if (file['fileType'] == "DIRECTORY") {  // insert a directory list entry
                    nestedFilesList.append(
                        `<li fileId="${file['id']}" fileType="D">\n
                            <button onclick="expandFolder(this)" class="folder-expand folder-unopened" type="button">+</button>\n
                            <span class="file-name">${file['name']}/</span>\n
                            <button onclick="renameFileButtonEvent(this)" class="file-rename-btn" type="button">Rename</button>
                            <button onclick="deleteFileEvent(this)" class="file-delete-btn" type="button">Delete</button>
                            <button onclick="moveFileEvent(this)" class="file-move-btn" type="button">Move</button>
                            <button onclick="placeFileEvent(this)" class="file-place-btn" type="button">Place</button>
                         </li>\n`
                    );
                } else if (file['fileType'] == "FILE") {  // insert a file list entry
                    nestedFilesList.append(
                        `<li fileId="${file['id']}" fileType="F">\n
                            <span class="file-name">${file['name']}</span>\n
                            <button onclick="renameFileButtonEvent(this)" class="file-rename-btn" type="button">Rename</button>
                            <button onclick="deleteFileEvent(this)" class="file-delete-btn" type="button">Delete</button>
                            <button onclick="moveFileEvent(this)" class="file-move-btn" type="button">Move</button>
                         </li>\n`
                    );
                }
            });
        }

        if (window.gCurrentlyMovingFile) {
            duringMoveState();
        } else {
            nonMoveState();
        }
    });
}

function getNestedFilesListId(folderId) {
    return `nested-files-of-${folderId}`;
}

/*
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

        // Hide/Show buttons
        var moveFolderButtons = nestedFolderList.find(".folder-move-btn");
        var placeFolderButtons = nestedFolderList.find(".folder-place-btn");
        var renameFolderButtons = nestedFolderList.find(".folder-rename-btn");
        var deleteFolderButtons = nestedFolderList.find(".folder-delete-btn");
        if (window.gCurrentlyMovingFile) {
            moveFolderButtons.hide();
            renameFolderButtons.hide();
            deleteFolderButtons.hide();

            placeFolderButtons.show();
        } else {
            moveFolderButtons.show();
            renameFolderButtons.show();
            deleteFolderButtons.show();

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
                    <button onclick="moveFileEvent(this)" class="file-move-btn" type="button">Move</button>
                 </li>\n`
            );
        });
    });
}
*/

$(document).ready(function() {
    // Global variables
    window.gCurrentlyMovingFile = 0;

    // setup CSRF for AJAX POST request
    var token = $("meta[name='_csrf']").attr("content");
    var header = $("meta[name='_csrf_header']").attr("content");
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader(header, token);
    });
});
