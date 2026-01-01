from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title
        title = Tex("CHAIN RULE AND APPLICATIONS", color=BLUE)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Step 2: Problem 4 introduction
        prob4_title = Tex("Problem 4", color=GREEN)
        prob4_func = MathTex("y = \\sqrt[7]{\\log\\left(\\frac{1}{x}\\right)}", color=YELLOW)
        prob4_title.to_edge(UP)
        prob4_func.next_to(prob4_title, DOWN)
        self.play(Write(prob4_title), Write(prob4_func))
        self.wait(3)

        # Step 3: First derivative step
        step1 = MathTex(
            "\\frac{dy}{dx} = \\frac{1}{7} \\left(\\log\\left(\\frac{1}{x}\\right)\\right)^{\\frac{1}{7} - 1} \\cdot \\frac{d}{dx} \\left(\\log\\left(\\frac{1}{x}\\right)\\right)",
            color=PURPLE
        )
        step1.next_to(prob4_func, DOWN)
        self.play(Write(step1))
        self.wait(4)

        # Step 4: Second derivative step
        step2 = MathTex(
            "= \\frac{1}{7} \\left(\\log\\left(\\frac{1}{x}\\right)\\right)^{-\\frac{6}{7}} \\cdot \\frac{d}{dx} (-\\log x)",
            color=ORANGE
        )
        step2.next_to(step1, DOWN)
        self.play(Write(step2))
        self.wait(3)

        # Step 5: Final result for Problem 4
        final4 = MathTex(
            "\\frac{dy}{dx} = \\frac{-1}{7x \\left(\\log\\left(\\frac{1}{x}\\right)\\right)^{6/7}}",
            color=RED
        )
        final4.next_to(step2, DOWN)
        self.play(Write(final4))
        self.wait(4)
        self.play(FadeOut(prob4_title), FadeOut(prob4_func), FadeOut(step1), FadeOut(step2), FadeOut(final4))

        # Step 6: Problem 2 introduction
        prob2_title = Tex("Second Problem", color=GREEN)
        prob2_func = MathTex("y = \\sin^4 x + \\sin(x^4) + \\sin(4x) + x^4", color=YELLOW)
        prob2_title.to_edge(UP)
        prob2_func.next_to(prob2_title, DOWN)
        self.play(Write(prob2_title), Write(prob2_func))
        self.wait(4)

        # Step 7: Breakdown of terms
        breakdown = MathTex(
            "\\frac{dy}{dx} = \\frac{d}{dx}(\\sin^4 x) + \\frac{d}{dx}(\\sin(x^4)) + \\frac{d}{dx}(\\sin(4x)) + \\frac{d}{dx}(x^4)",
            color=PURPLE
        )
        breakdown.next_to(prob2_func, DOWN)
        self.play(Write(breakdown))
        self.wait(4)

        # Step 8: sin^4 x derivative
        sin4_deriv = MathTex(
            "\\frac{d}{dx}(\\sin^4 x) = 4\\sin^3 x \\cdot \\frac{d}{dx}(\\sin x)",
            color=ORANGE
        )
        sin4_deriv.next_to(breakdown, DOWN)
        self.play(Write(sin4_deriv))
        self.wait(3)

        # Step 9: sin(x^4) derivative
        sinx4_deriv = MathTex(
            "\\frac{d}{dx}(\\sin(x^4)) = \\cos(x^4) \\cdot \\frac{d}{dx}(x^4)",
            color=TEAL
        )
        sinx4_deriv.next_to(sin4_deriv, DOWN)
        self.play(Write(sinx4_deriv))
        self.wait(3)

        # Step 10: sin(4x) derivative
        sin4x_deriv = MathTex(
            "\\frac{d}{dx}(\\sin(4x)) = \\cos(4x) \\cdot \\frac{d}{dx}(4x)",
            color=GOLD
        )
        sin4x_deriv.next_to(sinx4_deriv, DOWN)
        self.play(Write(sin4x_deriv))
        self.wait(3)

        # Step 11: x^4 derivative
        x4_deriv = MathTex(
            "\\frac{d}{dx}(x^4) = 4x^3",
            color=MAROON
        )
        x4_deriv.next_to(sin4x_deriv, DOWN)
        self.play(Write(x4_deriv))
        self.wait(2)

        # Step 12: Final combined derivative
        final2 = MathTex(
            "\\frac{dy}{dx} = 4\\sin^3 x (\\cos x) + \\cos(x^4) (4x^3) + \\cos(4x) (4) + 4x^3",
            color=RED
        )
        final2.next_to(x4_deriv, DOWN)
        self.play(Write(final2))
        self.wait(5)

        # Step 13: Summary
        summary = Tex("Chain Rule: Differentiate from outside in!", color=BLUE)
        summary.to_edge(DOWN)
        self.play(Write(summary))
        self.wait(3)

        self.wait(1)  # Total duration placeholder