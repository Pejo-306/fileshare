function expandFolder() {
    var folderId = $(this).parent().attr("folderId");
    var requestUrl = "/fileshare/get-sub-folder?parentFolderId=" + folderId;

    if ($(this).hasClass("folder-unopened")) {
        var nestedFoldersListId = `nested-folders-of-${folderId}`;

        if ($(`#${nestedFoldersListId}`).length) {
            // if the nested folders have already been retrieved
            // just reveal them
            $(`#${nestedFoldersListId}`).show();
        } else {
            // otherwise, request the nested folders list from the backedn
            $.get(requestUrl, function(data) {
                var parentFolder = $("#root-folder-container").find(`[folderId="${folderId}"]`);

                if (!jQuery.isEmptyObject(data)) {
                    var folderList = `<ul id="${nestedFoldersListId}">\n`;
                    Object.entries(data).forEach(([id, name]) => {
                        folderList +=
                            `<li folderId="${id}">\n
                                <button class="folder-expand folder-unopened _event-unattached" type="button">+</button>\n
                                <span class="folder-name">${name}/</span>\n
                             </li>\n`;
                    });
                    folderList += "</ul>\n";
                    parentFolder.append(folderList);

                    $("#root-folder-container").trigger("change");
                }
            });
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

$(document).ready(function() {
    $("#root-folder-container").change(function() {
        $(".folder-expand._event-unattached").each(function(index) {
            $(this).click(expandFolder);
            $(this).removeClass("_event-unattached");
        });
    });
    $("#root-folder-container").trigger("change");
});
