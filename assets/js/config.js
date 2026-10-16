/* Site configuration.
   The inbox address is assembled only at the moment a form is sent, so it never
   appears in page text, links or markup. */
window.IWIN_CONFIG = {
  _p: ["moc.liamg", "1askrowbew"],
  inbox: function () {
    var r = function (s) { return s.split("").reverse().join(""); };
    return r(this._p[1]) + String.fromCharCode(64) + r(this._p[0]);
  },
  partnerUrl: "https://web.works/contact",
  /* Payment links for the Support page. Paste a link to switch a button on.
     Until then, supporters send a pledge and receive a secure payment link by reply. */
  payments: {
    upi: "",        /* e.g. upi://pay?pa=yourid@bank&pn=iwin.in&cu=INR */
    razorpay: "",   /* e.g. https://razorpay.me/@yourhandle */
    paypal: "",     /* e.g. https://paypal.me/yourhandle */
    buymeacoffee: ""/* e.g. https://buymeacoffee.com/yourhandle */
  }
};
