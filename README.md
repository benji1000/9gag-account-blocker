9gag Account Blocker
======

Automatically blocks a list of accounts on 9gag.com by fetching their account IDs and sending block requests via the 9gag API.

Description
-----------

This script allows you to automatically block a list of accounts without having to do any tedious work.

Requirements
---------------

- Have a browser with Javascript enabled.
- Have a 9gag account.

Usage
------------------

- Open a browser tab on 9gag.com and log in.
- Open the Developer tools of your browser (generally, by hitting the F12 keyboard key or right-clicking on the page > Inspect).
- Go to the _Console_ tab of the Developer tools.
- Copy-paste the code from the `blocker.js` file of this repo into the developer console.
- Do what your browser instructs you to do to allow pasting (generally, it's as simple as typing _allow pasting_ or similar).
- Optionally edit the `usersToBlock` at the beginning. The default list is quite short and based on [this 9gag post](https://9gag.com/gag/avyR32n "9gag post that gave me the idea for this script").
- Type `blockAllUsers()` in the console, hit _Enter_ and let the script run :)

If you want to get (to eventually share with others) the list of accounts you've already blocked, you can run the function `getBlockedUsers()` after you have copy-pasted the script into your console.

How does it work?
------------------

It works by making requests to the 9gag API:
- One request to get the `accountId` from the username.
- One request to block the `accountId`.

Repeated for each username in the `usersToBlock` constant at the beginning of the script.

Contributions
-------

Contributions are welcome, especially code optimizations, bug fixes and new features. Please keep simplicity in mind!

You are also free to share your blocked accounts lists. I may or may not add these lists to this repo. Ideally, there should be separate, thematic accounts lists: bot, disinformation, racist, political, etc.

License
-------

Feel free to share or remix this script! Keep my name and a link to this page though.

[Creative Commons - Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).
