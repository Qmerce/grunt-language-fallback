angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('en', {"createPublisher.createSuccess":"Publisher created","createPublisher.header":"Sign Up To Become A Partner & Create Exciting Content Channels","createPublisher.invalidName":"Not a Valid Name.","createPublisher.invalidWebsite":"Not a Valid URL."});
    gettextCatalog.setStrings('fr', {"createPublisher.createSuccess":"Editeur Cree","createPublisher.header":"Inscris toi et deviens un partenaire Apester","createPublisher.invalidName":"Nom invalide"});
/* jshint +W100 */
}]);
