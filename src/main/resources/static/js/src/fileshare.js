function expandFolder() {
    var folderId = $(this).parent().attr("folderId");
    var requestUrl = "/fileshare/get-sub-folder?parentFolderId=" + folderId;

    if ($(this).hasClass("folder-unopened")) {
        var nestedFoldersListId = getNestedFoldersListId(folderId);

        if ($(`#${nestedFoldersListId}`).length) {
            // if the nested folders have already been retrieved
            // just reveal them
            $(`#${nestedFoldersListId}`).show();
        } else {
            // otherwise, request the nested folders list from the backend
            requestSubFolders(requestUrl, folderId);
        }

        $(this).text("-");
        $(this).removeClass("folder-unopened");
        $(this).addClass("folder-opened");
    } else if ($(this).hasClass("folder-opened")) {
        $(`#nested-folders-of-${folderId}`).hide();

        $(this).text("+");
        $(this).removeClass("folder-opened");
        $(this).addClass("folder-unopened");
    }
}

function newFolderButtonEvent() {
    var newFolderForm =
        `<div>
            <input type="text" name="name" placeholder="New Folder"/>
            <button class="_add-folder-event-unattached" type="Button">Add</button>
            <button class="_cancel-add-folder-event-unattached" type="Button">Cancel</button>
         </div>`;

    // disable 'New Folder' button
    $(this).prop("disabled", true);
    $(this).hide();

    $(this).parent().append(newFolderForm);

    $("#root-folder-container").trigger("change");
}

function addFolderEvent() {
    var newFolderButton = $(this).parent().parent().find(".new-folder-btn");
    var newFolderFields = $(this).parent();
    var requestUrl = "/fileshare/create-sub-folder";
    var parentFolderId = parseInt($(this).parent().parent().parent().parent().attr("folderId"));
    var folderName = newFolderFields.find("input:first-child").val();
    var parameters = { parentFolderId: parentFolderId, folderName: folderName };

    $.post(requestUrl, parameters, function(data) {
        // reload subfolders from the backed
        if (data["success"]) {
            requestUrl = "/fileshare/get-sub-folder?parentFolderId=" + parentFolderId;
            requestSubFolders(requestUrl, parentFolderId);
        }
    });
}

function cancelAddFolderEvent() {
    var newFolderButton = $(this).parent().parent().find(".new-folder-btn");
    var newFolderFields = $(this).parent();

    // enable 'New Folder' button
    newFolderButton.prop("disabled", false);
    newFolderButton.show();

    // remove new folder field and buttons
    newFolderFields.remove();
}

function renameFolderButtonEvent() {
    var folderName = $(this).parent().find("> span.folder-name").text();
    var deleteFolderButton = $(this).parent().find("> .folder-delete-btn");
    var renameFolderForm =
        `<span>
            <input type="text" name="name" placeholder="${folderName}"/>
            <button class="_confirm-rename-folder-event-unattached" type="Button">Confirm</button>
            <button class="_cancel-rename-folder-event-unattached" type="Button">Cancel</button>
         </span>`;

    // disable and hide 'Rename' and 'Delete' buttons
    $(this).prop("disabled", true);
    $(this).hide();
    deleteFolderButton.prop("disabled", true);
    deleteFolderButton.hide();

    deleteFolderButton.before(renameFolderForm);

    $("#root-folder-container").trigger("change");
}

function confirmRenameFolderEvent() {
    var folderContainer = $(this).parent().parent();
    var newFolderName = $(this).parent().find("input:first-child").val();
    var folderId = parseInt(folderContainer .attr("folderId"));
    var requestUrl = "/fileshare/rename-folder";
    var parameters = { folderId: folderId, newFolderName: newFolderName };

    $.ajax({
        url: requestUrl,
        type: "PATCH",
        data: parameters,
        success: function(data) {
            if (data["success"]) {
                var folderNameContainer = folderContainer.find("> span.folder-name");
                folderNameContainer.text(newFolderName);
            }
        }
    });

    removeRenameFolderFields($(this));
}

function cancelRenameFolderEvent() {
    removeRenameFolderFields($(this));
}

function removeRenameFolderFields(buttonElement) {
    var renameFolderButton = buttonElement.parent().parent().find(".folder-rename-btn");
    var deleteFolderButton = buttonElement.parent().parent().find("> .folder-delete-btn");
    var renameFolderFields = buttonElement.parent();

    // enable 'Rename' and 'Delete' buttons
    renameFolderButton.prop("disabled", false);
    renameFolderButton.show();
    deleteFolderButton.prop("disabled", false);
    deleteFolderButton.show();

    // remove rename folder field and buttons
    renameFolderFields.remove();
}

function deleteFolderEvent() {
    var parentContainer = $(this).parent();
    var folderName = parentContainer.find("> span.folder-name").text();

    if (confirm(`Are you sure you want to delete folder '${folderName}'`)) {
        var requestUrl = "/fileshare/delete-folder";
        var parameters = { folderId: parseInt(parentContainer.attr("folderId")) };

        $.ajax({
            url: requestUrl,
            type: "DELETE",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    parentContainer.remove();
                    alert(`Folder '${folderName}' has been successfully deleted`);
                }
            }
        });
    }
}

function moveFolderEvent() {
    var folderId = $(this).parent().attr("folderId");
    var placeFolderButtons = $(`:not([folderId=${folderId}])`).find("> .folder-place-btn");
    var moveFolderButtons = $(".folder-move-btn");
    var cancelPlaceFolderButton =
        `<button class="folder-cancel-place-btn _cancel-place-folder-event-unattached" type="button">Cancel</button>`;

    // Enable "Place" buttons
    placeFolderButtons.show();
    // Disable "Move" buttons
    moveFolderButtons.hide();

    // Add a "Cancel" button to cancel move operation
    $(this).parent().find("> span.folder-name").after(cancelPlaceFolderButton);

    window.gCurrentlyMovingFolder = folderId;
    $("#root-folder-container").trigger("change");
}

function placeFolderEvent() {
    var folderId = parseInt($(this).parent().attr("folderId"));
    var nestedFoldersListId = getNestedFoldersListId(folderId);
    var placeFolderButtons = $(".folder-place-btn");
    var moveFolderButtons = $(".folder-move-btn");
    var cancelPlaceFolderButton = $(".folder-cancel-place-btn");
    var movedFolderContainer = $(`[folderId="${window.gCurrentlyMovingFolder}"]`);
    var requestUrl = "/fileshare/move-folder";
    var parameters = { folderId: window.gCurrentlyMovingFolder, newParentId: folderId };

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
        // Enable "Move" buttons
        moveFolderButtons.show();
        // Remove "Cancel" place button
        cancelPlaceFolderButton.remove();

        window.gCurrentlyMovingFolder = 0;
    }
}

function cancelPlaceFolderEvent() {
    var placeFolderButtons = $(".folder-place-btn");
    var moveFolderButtons = $(".folder-move-btn");

    // Disable "Place" buttons
    placeFolderButtons.hide();
    // Enable "Move" buttons
    moveFolderButtons.show();
    // Remove "Cancel" place button
    $(this).remove();  // self-destruct

    window.gCurrentlyMovingFolder = 0;
}

function requestSubFolders(requestUrl, parentFolderId) {
    var nestedFoldersListId = getNestedFoldersListId(parentFolderId);

    $.get(requestUrl, function(data) {
        var parentFolder = $("#root-folder-container").find(`[folderId="${parentFolderId}"]`);

        var folderList = `<ul id="${nestedFoldersListId}">\n`;
        // add a button to create a new folder
        folderList +=
            `<li>\n
                <button class="new-folder-btn _new-folder-event-unattached" type="button">New Folder</button>\n
             </li>\n`;
        // add the list of sub folders
        Object.entries(data).forEach(([id, name]) => {
            folderList +=
                `<li folderId="${id}">\n
                    <button class="folder-expand folder-unopened _folder-expand-event-unattached" type="button">+</button>\n
                    <span class="folder-name">${name}/</span>\n
                    <button class="folder-rename-btn _rename-folder-event-unattached" type="button">Rename</button>
                    <button class="folder-delete-btn _delete-folder-event-unattached" type="button">Delete</button>
                    <button class="folder-move-btn _move-folder-event-unattached" type="button">Move</button>
                    <button class="folder-place-btn _place-folder-event-unattached" type="button">Place</button>
                 </li>\n`;
        });
        folderList += "</ul>\n";
        $(`#${nestedFoldersListId}`).remove();
        parentFolder.append(folderList);

        // Hide/Show 'Move/Place' buttons
        var moveFolderButtons = $(`#${nestedFoldersListId}`).find(".folder-move-btn");
        var placeFolderButtons = $(`#${nestedFoldersListId}`).find(".folder-place-btn");
        if (window.gCurrentlyMovingFolder) {
            moveFolderButtons.hide();
            placeFolderButtons.show();
        } else {
            moveFolderButtons.show();
            placeFolderButtons.hide();
        }

        $("#root-folder-container").trigger("change");
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

    var eventHandlers = {
         "_folder-expand-event-unattached": expandFolder,
         "_new-folder-event-unattached": newFolderButtonEvent,
         "_add-folder-event-unattached": addFolderEvent,
         "_cancel-add-folder-event-unattached": cancelAddFolderEvent,
         "_delete-folder-event-unattached": deleteFolderEvent,
         "_rename-folder-event-unattached": renameFolderButtonEvent,
         "_confirm-rename-folder-event-unattached": confirmRenameFolderEvent,
         "_cancel-rename-folder-event-unattached": cancelRenameFolderEvent,
         "_move-folder-event-unattached": moveFolderEvent,
         "_place-folder-event-unattached": placeFolderEvent,
         "_cancel-place-folder-event-unattached": cancelPlaceFolderEvent,
    };
    $("#root-folder-container").change(function() {
        Object.entries(eventHandlers).forEach(([eventClass, handler]) => {
            $(`.${eventClass}`).each(function(index) {
                $(this).click(handler);
                $(this).removeClass(eventClass);
            });
        });
    });
    $("#root-folder-container").trigger("change");
});
