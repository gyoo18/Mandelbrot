package org.gyoostudio.graphiques;

import org.lwjgl.glfw.GLFW;
import org.lwjgl.glfw.GLFWCursorPosCallback;
import org.lwjgl.glfw.GLFWFramebufferSizeCallback;
import org.lwjgl.glfw.GLFWKeyCallback;
import org.lwjgl.glfw.GLFWMouseButtonCallback;
import org.lwjgl.glfw.GLFWScrollCallback;

public class Fenêtre {

    public long glfwFenêtre;
    public boolean actif = true;
    private Peintre peintre;

    public int largeurPixels = 600;
    public int hauteurPixels = 600;

    public Fenêtre(){
        System.out.println("Fenêtre");
        GLFW.glfwInit();
        GLFW.glfwDefaultWindowHints();
        GLFW.glfwWindowHint(GLFW.GLFW_SAMPLES,4);
        glfwFenêtre = GLFW.glfwCreateWindow(largeurPixels, hauteurPixels, "Battleship", 0, 0);
        if ( glfwFenêtre <= 0 ){
            throw new RuntimeException("La fenêtre GLFW n'a pas pue être créé.");
        }
        GLFW.glfwMakeContextCurrent(glfwFenêtre);
        GLFW.glfwSetFramebufferSizeCallback(glfwFenêtre, surFenêtreModifiée);
        GLFW.glfwSetKeyCallback(glfwFenêtre,surToucheClavier);
        GLFW.glfwSetCursorPosCallback(glfwFenêtre, surCurseurBouge);
        GLFW.glfwSetScrollCallback(glfwFenêtre, surMolletteSourisRoulée);
        GLFW.glfwSetMouseButtonCallback(glfwFenêtre, surSourisClique);
        GLFW.glfwShowWindow(glfwFenêtre);
    }

    public void lierPeintre(Peintre peintre) {
        this.peintre = peintre;
    }

    private GLFWFramebufferSizeCallback surFenêtreModifiée = new GLFWFramebufferSizeCallback() {
        @Override
        public void invoke(long fenêtre, int largeur, int hauteur){
            largeurPixels = largeur;
            hauteurPixels = hauteur;
            peintre.surModificationFenêtre(largeur, hauteur);
        }
    };

    private GLFWKeyCallback surToucheClavier = new GLFWKeyCallback() {
        private Fenêtre fenêtre;

        public GLFWKeyCallback donnerFenêtre(Fenêtre fenêtre){
            this.fenêtre = fenêtre;
            return this;
        }
        //cspell:ignore codescan
        @Override
        public void invoke(long fenêtre, int touche, int codescan, int action, int mods) {
        }
        
    }.donnerFenêtre(this);

    private GLFWCursorPosCallback surCurseurBouge = new GLFWCursorPosCallback() {
        private Fenêtre fenêtre;

        public GLFWCursorPosCallback donnerFenêtre(Fenêtre fenêtre){
            this.fenêtre = fenêtre;
            return this;
        }

        //cspell:ignore xpos ypos
        @Override
        public void invoke(long fenêtre, double xpos, double ypos) {
        }
    }.donnerFenêtre(this);

    private GLFWScrollCallback surMolletteSourisRoulée = new GLFWScrollCallback() {
        private Fenêtre fenêtre;

        public GLFWScrollCallback donnerFenêtre(Fenêtre fenêtre){
            this.fenêtre = fenêtre;
            return this;
        }

        //cspell:ignore xoffset yoffset
        @Override
        public void invoke(long window, double xoffset, double yoffset) {
        }
        
    }.donnerFenêtre(this);

    private GLFWMouseButtonCallback surSourisClique = new GLFWMouseButtonCallback() {
        private Fenêtre fenêtre;

        public GLFWMouseButtonCallback donnerFenêtre(Fenêtre fenêtre){
            this.fenêtre = fenêtre;
            return this;
        }

        @Override
        public void invoke(long window, int button, int action, int mods) {
        }
        
    }.donnerFenêtre(this);

    public void mettreÀJour(){
        if (GLFW.glfwWindowShouldClose(glfwFenêtre)){
            actif = false;
        }
        
        peintre.mettreÀJour();

        GLFW.glfwSwapBuffers(glfwFenêtre);
        GLFW.glfwPollEvents();
    }

    public void détruire(){
        peintre.détruire();
        GLFW.glfwTerminate();
    }
}
