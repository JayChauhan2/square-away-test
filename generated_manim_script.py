from manim import *

class Explainer(Scene):
    def construct(self):
        # Step 1: Introduction
        title = Tex("Find the second derivative of the function", color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)

        # Step 2: Display the function
        func = MathTex("f(x) = x^3", color=GREEN)
        func.next_to(title, DOWN, buff=1)
        self.play(Write(func))
        self.wait(1)

        # Step 3: First derivative
        first_deriv = MathTex("f'(x) = 3x^2", color=YELLOW)
        first_deriv.next_to(func, DOWN, buff=1)
        self.play(Write(first_deriv))
        self.wait(1)

        # Step 4: Second derivative
        second_deriv = MathTex("f''(x) = 6x", color=RED)
        second_deriv.next_to(first_deriv, DOWN, buff=1)
        self.play(Write(second_deriv))
        self.wait(1)

        # Step 5: Visual representation
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-20, 20, 5],
            axis_config={"color": WHITE},
        )
        axes.to_edge(DOWN)

        # Plot the original function
        graph = axes.plot(lambda x: x**3, color=GREEN)
        graph_label = axes.get_graph_label(graph, label="f(x) = x^3", color=GREEN)

        # Plot the first derivative
        first_deriv_graph = axes.plot(lambda x: 3*x**2, color=YELLOW)
        first_deriv_label = axes.get_graph_label(first_deriv_graph, label="f'(x) = 3x^2", color=YELLOW)

        # Plot the second derivative
        second_deriv_graph = axes.plot(lambda x: 6*x, color=RED)
        second_deriv_label = axes.get_graph_label(second_deriv_graph, label="f''(x) = 6x", color=RED)

        self.play(Create(axes), Create(graph), Write(graph_label))
        self.wait(1)
        self.play(Create(first_deriv_graph), Write(first_deriv_label))
        self.wait(1)
        self.play(Create(second_deriv_graph), Write(second_deriv_label))
        self.wait(1)

        # Step 6: Summary
        summary = Tex("The second derivative of f(x) = x^3 is f''(x) = 6x", color=PURPLE)
        summary.to_edge(DOWN)
        self.play(Write(summary))
        self.wait(2)

        self.wait(1)  # Total duration placeholder