// ==UserScript==
// @name         ModeBoge Premium™
// @namespace    https://karachan.org
// @version      0.3
// @description  Dodaje nowe powody banów oraz przycisk SBIP do adminControls
// @author       egipthardkor
// @match        https://karachan.org/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        newReasons: [
            {name: 'Residential', reason: 'residential proxy', expires: '30d', appeal: '1w'},
            {name: 'TikTok', reason: 'tiksraka', expires: '1d', appeal: '2h'},
            {name: 'Implikowanie', reason: 'implikowanie', expires: '12h', appeal: '2h'},
            {name: '/fz/', reason: '/fz/ ->', expires: '6h', appeal: '1h'},
            {name: '/p/', reason: '/p/ ->', expires: '6h', appeal: '1h'},
            {name: '/s/', reason: '/s/ ->', expires: '6h', appeal: '1h'}
        ],
        boardSelections: [
            {text: 'Wszystkie poza fz/, 4/ i kara/', excludedBoards: ['fz', '4', 'kara']},
            {text: 'Wszystkie poza p/, 4/ i kara/', excludedBoards: ['p', '4', 'kara']},
            {text: 'Wszystkie poza s/, 4/ i kara/', excludedBoards: ['s', '4', 'kara']}
        ]
    };

    function addBanReasons() {
        $(document).ready(() => {
            const $reasonInput = $("input[name=reason]");
            const $expiresInput = $("input[name=expires]");
            if (!$reasonInput.length || window.location.href.indexOf("https://karachan.org/mod.php?/bans/add") !== 0) return;

            function insertSmallLink($after, text, callback) {
                $(`<a href="#" class="lnkSmall">${text}</a>`)
                    .insertAfter($after)
                    .before(" ")
                    .click(callback);
            }

            function createReasonCallback(reason) {
                return (event) => {
                    event.preventDefault();
                    $reasonInput.val(reason.reason);
                    $expiresInput.val(reason.expires);
                    $("input[name=appeal]").val(reason.appeal);
                };
            }

            config.newReasons.forEach((reason) => {
                const $reasonLinks = $reasonInput.nextUntil($expiresInput, "a.lnkSmall");
                const $lastLink = $reasonLinks.last();
                if ($lastLink.length) {
                    insertSmallLink($lastLink, reason.name, createReasonCallback(reason));
                } else {
                    insertSmallLink($reasonInput, reason.name, createReasonCallback(reason));
                }
            });

            config.boardSelections.forEach((selection) => {
                createBoardSelectionLink(selection.text, selection.excludedBoards);
            });
        });
    }

    function createBoardSelectionLink(text, excludedBoards) {
        $(`<a href="#" class="lnkSmall">${text}</a>`)
            .insertBefore("#boardSelect div:first")
            .after("<br>")
            .click((e) => {
                e.preventDefault();
                const $checkboxes = $("#boardSelect input[type=checkbox]");
                if ($checkboxes.length) {
                    $checkboxes.prop("checked", false);
                    const selector = excludedBoards.map(board => `:not([id=${board}])`).join("");
                    $checkboxes.filter(selector).prop("checked", true);
                }
            });
    }

    function addSBIPButton() {
        const adminControls = document.querySelectorAll('.adminControls');
        adminControls.forEach(control => {
            const ipElement = control.parentElement.querySelector('.posterIp a');
            if (!ipElement) return;

            const ip = ipElement.textContent.trim();
            if (!ip || control.querySelector('[title="Search by IP"]')) return;

            const sbpLink = control.querySelector('[title="Search for posts"]');
            if (!sbpLink) return;

            const sbipLink = document.createElement('a');
            sbipLink.title = 'Search by IP';
            sbipLink.href = `https://karachan.org/mod.php?/search/ip&ip=${ip}`;
            sbipLink.textContent = 'SBIP';

            const separator = document.createTextNode(' / ');
            sbpLink.parentNode.insertBefore(separator, sbpLink.nextSibling);
            sbpLink.parentNode.insertBefore(sbipLink, separator.nextSibling);
        });
    }

    if (window.location.href.indexOf("https://karachan.org/mod.php?/bans/add") === 0) {
        addBanReasons();
    } else {
        window.addEventListener('load', addSBIPButton);
        const observer = new MutationObserver(addSBIPButton);
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();