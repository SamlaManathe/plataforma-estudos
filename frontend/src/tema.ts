import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Paleta da plataforma (do tom 0 mais claro ao 9 mais escuro)
const plataforma: MantineColorsTuple = [
  "#eef3ff",
  "#dce4f5",
  "#b9c7e2",
  "#94a8d0",
  "#748dc1",
  "#5f7cb8",
  "#5474b4",
  "#44639f",
  "#39588f",
  "#2d4b81",
];

export const tema = createTheme({
  primaryColor: "plataforma",
  primaryShade: 7,
  colors: { plataforma },
  fontFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
  headings: {
    fontFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
    fontWeight: "700",
  },
  black: "#1f2a2e",
  defaultRadius: "md",
  components: {
    Button: { defaultProps: { radius: "md", size: "md" } },
    Badge: { styles: { root: { textTransform: "none", fontWeight: 700 } } },
    Modal: {
      defaultProps: {
        radius: "lg",
        padding: "xl",
        overlayProps: { backgroundOpacity: 0.4, blur: 2 },
      },
      styles: { title: { fontSize: 22, fontWeight: 700 } },
    },
    TextInput: { defaultProps: { size: "md" } },
    PasswordInput: { defaultProps: { size: "md" } },
    Select: { defaultProps: { size: "md" } },
  },
});