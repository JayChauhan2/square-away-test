from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title screen
        title = Tex("CHAIN RULE AND APPLICATIONS", color=BLUE)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Problem 1
        problem1_title = Tex("Problem 1:", color=GREEN)
        problem1_eq = MathTex("y = \\sqrt[7]{\\log\\left(\\frac{1}{x}\\right)}", color=YELLOW)
        problem1_group = VGroup(problem1_title, problem1_eq).arrange(DOWN)
        self.play(Write(problem1_title))
        self.play(Write(problem1_eq))
        self.wait(3)

        # Step 1: Rewrite using exponent
        step1 = MathTex("y = \\left(\\log\\left(\\frac{1}{x}\\right)\\right)^{\\frac{1}{7}}", color=PURPLE)
        self.play(Transform(problem1_eq, step1))
        self.wait(2)

        # Step 2: Apply chain rule
        step2 = MathTex("\\frac{dy}{dx} = \\frac{1}{7}\\left(\\log\\left(\\frac{1}{x}\\right)\\right)^{-\\frac{6}{7}} \\frac{d}{dx}\\left(\\log\\left(\\frac{1}{x}\\right)\\right)", color=ORANGE)
        self.play(Transform(problem1_eq, step2))
        self.wait(3)

        # Step 3: Differentiate log
        step3 = MathTex("\\frac{d}{dx}\\left(\\log\\left(\\frac{1}{x}\\right)\\right) = -\\frac{1}{x}", color=RED)
        self.play(Write(step3.next_to(problem1_eq, DOWN)))
        self.wait(2)

        # Step 4: Substitute and simplify
        step4 = MathTex("\\frac{dy}{dx} = -\\frac{1}{7x}\\left(\\log\\left(\\frac{1}{x}\\right)\\right)^{-\\frac{6}{7}}", color=GREEN)
        self.play(Transform(problem1_eq, step4))
        self.play(FadeOut(step3))
        self.wait(2)

        # Final form
        final1 = MathTex("\\frac{dy}{dx} = -\\frac{1}{7x\\left(\\log\\left(\\frac{1}{x}\\right)\\right)^{\\frac{6}{7}}}", color=BLUE)
        self.play(Transform(problem1_eq, final1))
        self.wait(3)
        self.play(FadeOut(problem1_group))

        # Problem 2
        problem2_title = Tex("Problem 2:", color=GREEN)
        problem2_eq = MathTex("y = \\sin^4 x + \\sin(x^4) + \\sin(4x) + x^4", color=YELLOW)
        problem2_group = VGroup(problem2_title, problem2_eq).arrange(DOWN)
        self.play(Write(problem2_title))
        self.play(Write(problem2_eq))
        self.wait(3)

        # Differentiate sin^4(x)
        sin4_deriv = MathTex("\\frac{d}{dx}(\\sin^4 x) = 4\\sin^3 x \\cos x", color=PURPLE)
        self.play(Write(sin4_deriv.next_to(problem2_eq, DOWN)))
        self.wait(2)

        # Differentiate sin(x^4)
        sinx4_deriv = MathTex("\\frac{d}{dx}(\\sin(x^4)) = 4x^3 \\cos(x^4)", color=ORANGE)
        self.play(Write(sinx4_deriv.next_to(sin4_deriv, DOWN)))
        self.wait(2)

        # Differentiate sin(4x)
        sin4x_deriv = MathTex("\\frac{d}{dx}(\\sin(4x)) = 4\\cos(4x)", color=RED)
        self.play(Write(sin4x_deriv.next_to(sinx4_deriv, DOWN)))
        self.wait(2)

        # Differentiate x^4
        x4_deriv = MathTex("\\frac{d}{dx}(x^4) = 4x^3", color=GREEN)
        self.play(Write(x4_deriv.next_to(sin4x_deriv, DOWN)))
        self.wait(2)

        # Combine all derivatives
        combined = MathTex("\\frac{dy}{dx} = 4\\sin^3 x \\cos x + 4x^3 \\cos(x^4) + 4\\cos(4x) + 4x^3", color=BLUE)
        self.play(Transform(problem2_eq, combined))
        self.play(FadeOut(sin4_deriv), FadeOut(sinx4_deriv), FadeOut(sin4x_deriv), FadeOut(x4_deriv))
        self.wait(3)

        self.wait(1)  # Total duration placeholder