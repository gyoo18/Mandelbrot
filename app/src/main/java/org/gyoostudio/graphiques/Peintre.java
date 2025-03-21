//cspell:ignore nuasourcefrag
//cspell:ignore nuasourcesom
//cspell:ignore mediump
//cspell:ignore transformee
//cspell:ignore coul

package org.gyoostudio.graphiques;


import java.util.ArrayList;

import org.lwjgl.opengl.GL;
import org.lwjgl.opengl.GL46;

public class Peintre {
	
	private Fenêtre fenêtre;
	
	public Peintre() {
		System.out.println("Peintre");
		
		GL.createCapabilities();
		
		GL46.glClearColor(0.6f, 0.6f, 0.6f, 1f);

		GL46.glEnable(GL46.GL_DEPTH_TEST);
		//GL46.glEnable(GL46.GL_BLEND);

		glErreur(true);
	}

	public void lierFenêtre(Fenêtre fenêtre){
		this.fenêtre = fenêtre;
		GL46.glViewport(0, 0, fenêtre.largeurPixels, fenêtre.hauteurPixels);
	}
	
	public void surModificationFenêtre(int largeur, int hauteur) {
		GL46.glViewport(0, 0, largeur, hauteur);
	}
	
	public void mettreÀJour() {
		GL46.glClear(GL46.GL_COLOR_BUFFER_BIT|GL46.GL_DEPTH_BUFFER_BIT);

		glErreur(false);
	}
	
	public void détruire() {
		GL.destroy();
	}
	
	public boolean glErreur(boolean direNoError) {
		int erreur = GL46.glGetError();
		switch (erreur) {
			case GL46.GL_INVALID_ENUM:
				System.err.println("GL_INVALID_ENUM");
				break;
			case GL46.GL_INVALID_VALUE:
				System.err.println("GL_INVALID_VALUE");
				break;
			case GL46.GL_INVALID_OPERATION:
				System.err.println("GL_INVALID_OPERATION");
				break;
			case GL46.GL_INVALID_FRAMEBUFFER_OPERATION:
				System.err.println("GL_INVALID_FRAMEBUFFER_OPERATION");
				break;
			case GL46.GL_OUT_OF_MEMORY:
				System.err.println("GL_OUT_OF_MEMORY");
				break;
			case GL46.GL_STACK_UNDERFLOW:
				System.err.println("GL_STACK_UNDERFLOW");
				break;
			case GL46.GL_STACK_OVERFLOW:
				System.err.println("GL_STACK_OVERFLOW");
				break;
			case GL46.GL_NO_ERROR:
				if (direNoError) {
					System.err.println("GL_NO_ERROR");
				}
				break;
		}
		
		return erreur != GL46.GL_NO_ERROR;
	}
}
