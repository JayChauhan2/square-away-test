from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title screen
        title = Tex("Higher Order Derivatives", "\\\\ from Calculus BC", font_size=48)
        title.set_color_by_gradient(BLUE, GREEN)

        # Create a simple function graph
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-5, 5, 1],
            axis_config={"color": WHITE},
        )
        graph = axes.plot(lambda x: x**3 - 2*x, color=YELLOW)

        title_group = VGroup(title, axes, graph).arrange(DOWN, buff=1)
        self.play(Write(title))
        self.play(FadeIn(axes), Create(graph))
        self.wait(2)
        self.clear()

        # Step 2: Definition
        definition = Tex(
            "Higher order derivatives extend differentiation:\\\\",
            "First: $f'(x)$ or $\\\\frac{df}{dx}$\\\\",
            "Second: $f''(x)$ or $\\\\frac{d^2f}{dx^2}$\\\\",
            "Third: $f'''(x)$ or $\\\\frac{d^3f}{dx^3}$\\\\",
            "$n$-th: $f^{(n)}(x)$ or $\\\\frac{d^n f}{dx^n}$",
            font_size=36
        )
        definition.set_color_by_tex("First", RED)
        definition.set_color_by_tex("Second", GREEN)
        definition.set_color_by_tex("Third", BLUE)
        definition.set_color_by_tex("n-th", PURPLE)

        self.play(Write(definition))
        self.wait(3)
        self.clear()

        # Step 3: Visual demonstration
        axes = Axes(
            x_range=[-2, 2, 1],
            y_range=[-3, 3, 1],
            axis_config={"color": WHITE},
        )
        f_graph = axes.plot(lambda x: x**3 - x, color=YELLOW)
        f_label = axes.get_graph_label(f_graph, label="f(x)", direction=UP)

        f_prime_graph = axes.plot(lambda x: 3*x**2 - 1, color=RED)
        f_prime_label = axes.get_graph_label(f_prime_graph, label="f'(x)", direction=UP/2)

        f_double_prime_graph = axes.plot(lambda x: 6*x, color=GREEN)
        f_double_prime_label = axes.get_graph_label(f_double_prime_graph, label="f''(x)", direction=DOWN/2)

        self.play(Create(axes), Create(f_graph), Write(f_label))
        self.wait(1)
        self.play(Create(f_prime_graph), Write(f_prime_label))
        self.wait(1)
        self.play(Create(f_double_prime_graph), Write(f_double_prime_label))
        self.wait(3)
        self.clear()

        # Step 4: Notation comparison
        leibniz = MathTex("\frac{d^2f}{dx^2}", font_size=48).set_color(RED)
        lagrange = MathTex("f''(x)", font_size=48).set_color(BLUE)

        notation_title = Tex("Notation Comparison", font_size=36).set_color(YELLOW)

        notation_group = VGroup(
            notation_title,
            VGroup(leibniz, lagrange).arrange(RIGHT, buff=2)
        ).arrange(DOWN, buff=1)

        self.play(Write(notation_title))
        self.play(Write(leibniz), Write(lagrange))
        self.wait(2)
        self.clear()

        # Step 5: Applications
        apps_title = Tex("Applications", font_size=36).set_color(GREEN)

        app1 = Tex("• Concavity & inflection points", font_size=32).set_color(RED)
        app2 = Tex("• Motion analysis (acceleration)", font_size=32).set_color(BLUE)
        app3 = Tex("• Solving differential equations", font_size=32).set_color(PURPLE)

        apps = VGroup(app1, app2, app3).arrange(DOWN, buff=0.5, aligned_edge=LEFT)

        self.play(Write(apps_title))
        self.play(Write(apps))
        self.wait(3)
        self.clear()

        # Step 6: Example calculation
        example_title = Tex("Example: $f(x) = x^3 + 2x^2 - 5x + 1$", font_size=36)

        step1 = MathTex("f'(x) = 3x^2 + 4x - 5", font_size=32).set_color(RED)
        step2 = MathTex("f''(x) = 6x + 4", font_size=32).set_color(GREEN)
        step3 = MathTex("f'''(x) = 6", font_size=32).set_color(BLUE)
        step4 = MathTex("f^{(4)}(x) = 0", font_size=32).set_color(PURPLE)

        example = VGroup(
            example_title,
            step1, step2, step3, step4
        ).arrange(DOWN, buff=0.5)

        self.play(Write(example_title))
        self.play(Write(step1))
        self.wait(1)
        self.play(Write(step2))
        self.wait(1)
        self.play(Write(step3))
        self.wait(1)
        self.play(Write(step4))
        self.wait(2)
        self.clear()

        # Step 7: Summary
        summary_title = Tex("Key Concepts", font_size=40).set_color(YELLOW)

        point1 = Tex("• Repeated differentiation", font_size=32).set_color(RED)
        point2 = Tex("• Consistent notation patterns", font_size=32).set_color(BLUE)
        point3 = Tex("• Wide applications", font_size=32).set_color(GREEN)

        summary = VGroup(
            summary_title,
            point1, point2, point3
        ).arrange(DOWN, buff=0.5)

        self.play(Write(summary_title))
        self.play(Write(point1))
        self.play(Write(point2))
        self.play(Write(point3))
        self.wait(3)

        # Total duration placeholder
        self.wait(1)