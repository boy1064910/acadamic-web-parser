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
            //  Implements \href{url}{math}
            //
            HREF_attribute: function(name) {
              console.log("name");
                var url = this.GetArgument(name),
                    arg = this.GetArgumentMML(name);
                this.Push(arg.With({ href: url }));
            },
            //
            //  Implements \FormInput[knowledgePointContentId]{code}
            //  Implements \FormInput[size][class]{name}
            //
            FormInput: function(name) {
                var contentid = this.GetBrackets(name),
                    name = this.GetArgument(name);
                var input = HTML.Element("input", { type: "text", name: name });
                input.setAttribute("size", "2");
                input.setAttribute("contentid", contentid);
                // input.setAttribute("xmlns","http://www.w3.org/1999/xhtml");
                var mml = MML["annotation-xml"](MML.xml(input)).With({ encoding: "application/xhtml+xml", isToken: true });
                console.log(this);
                this.Push(MML.semantics(mml));

            }
        });

    }));

MathJax.Ajax.loadComplete("[MathJax]/extensions/TeX/forminput.js");