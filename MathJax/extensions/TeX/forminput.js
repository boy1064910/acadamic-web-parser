MathJax.Callback.Queue(
    MathJax.Hub.Register.StartupHook("TeX Jax Ready", function() {
        var VERSION = "1.0";

        var TEX = MathJax.InputJax.TeX,
            TEXDEF = TEX.Definitions,
            MML = MathJax.ElementJax.mml,
            HTML = MathJax.HTML;

        TEXDEF.macros.href = 'HREF_attribute';
        TEXDEF.macros.FormInput = "FormInput";
        

        TEX.Parse.Augment({
            //
            //  Implements \FormInput{code}
            //  Implements \FormInput[size][class]{name}
            //
            FormInput: function(name) {
                // var contentid = this.GetBrackets(name);
                var code = this.GetArgument(name);
                var input = HTML.Element("input", { type: "text",className:"weui-input"});
                input.setAttribute("code", code);
                var mml = MML["annotation-xml"](MML.xml(input)).With({ encoding: "application/xhtml+xml", isToken: true });
                this.Push(MML.semantics(mml));

            }
        });

    }));

MathJax.Ajax.loadComplete("[MathJax]/extensions/TeX/forminput.js");