from manim import *

class Explainer(Scene):
    def construct(self):
        # Step 1: Title screen
        title = Tex("Differentiate $\\sin(3x^2)$ with respect to $x$", color=BLUE)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Step 2: Introduction to chain rule
        chain_rule_title = Tex("Chain Rule", color=GREEN)
        chain_rule_formula = MathTex("\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}", color=YELLOW)
        chain_rule_formula.next_to(chain_rule_title, DOWN)

        self.play(Write(chain_rule_title))
        self.wait(0.5)
        self.play(Write(chain_rule_formula))
        self.wait(1)

        # Step 3: Breakdown of function
        breakdown = MathTex("y = \\sin(u)", "u = 3x^2", color=PURPLE)
        breakdown.arrange(DOWN, buff=0.5)
        breakdown.next_to(chain_rule_formula, DOWN, buff=1)

        self.play(Write(breakdown[0]))
        self.wait(0.5)
        self.play(Write(breakdown[1]))
        self.wait(1)

        # Step 4: Calculate dy/du
        dy_du = MathTex("\\frac{dy}{du} = \\cos(u) = \\cos(3x^2)", color=RED)
        dy_du.next_to(breakdown, DOWN, buff=1)

        self.play(Write(dy_du))
        self.wait(1)

        # Step 5: Calculate du/dx
        du_dx = MathTex("\\frac{du}{dx} = \\frac{d}{dx}(3x^2) = 6x", color=ORANGE)
        du_dx.next_to(dy_du, DOWN, buff=0.5)

        self.play(Write(du_dx))
        self.wait(1)

        # Step 6: Apply chain rule
        chain_application = MathTex("\\frac{dy}{dx} = \\cos(3x^2) \\cdot 6x = 6x \\cos(3x^2)", color=TEAL)
        chain_application.next_to(du_dx, DOWN, buff=0.5)

        self.play(Write(chain_application))
        self.wait(1)

        # Step 7: Final result
        final_result = MathTex("\\boxed{6x \\cos(3x^2)}", color=GOLD)
        final_result.scale(1.2)
        final_result.next_to(chain_application, DOWN, buff=1)

        self.play(Write(final_result))
        self.wait(1.5)

        # Step 8: Summary
        summary = Tex("Chain Rule Summary:", color=BLUE)
        summary_steps = VGroup(
            Tex("1. Identify inner and outer functions", color=PURPLE),
            Tex("2. Differentiate outer function", color=RED),
            Tex("3. Differentiate inner function", color=ORANGE),
            Tex("4. Multiply the results", color=TEAL)
        )
        summary_steps.arrange(DOWN, buff=0.3)
        summary_group = VGroup(summary, summary_steps)
        summary_group.arrange(DOWN, buff=0.5)

        self.play(FadeOut(chain_rule_title), FadeOut(chain_rule_formula),
                 FadeOut(breakdown), FadeOut(dy_du), FadeOut(du_dx),
                 FadeOut(chain_application), FadeOut(final_result))
        self.play(Write(summary))
        self.wait(0.5)
        self.play(Write(summary_steps))
        self.wait(2)

        self.wait(1)  # Total duration placeholder