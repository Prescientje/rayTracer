/*****************************************************************************
 * Elliptipool.cpp                                                           *
 *                                                                           *
 *    This graphics procedure simulates elliptipool, where a ray reflects    *
 * continuously off the inside wall of an ellipse.  The user indicates the   *
 * starting point of the ray as either on a focus, inside the foci, or       *
 * outside the foci.                                                         *
 *                                                                           *
 * Author:  Cary Laxer                                                       *
 *                                                                           *
 * Modification History:                                                     *
 *    February 5, 1992	- Creation. Displayed the bounding ellipse and its   *
 *			  foci. Determined the starting point and direction for the ray  *
 *			  to follow. Found the point of intersection and the reflected   *
 *			  ray. Implemented a loop to draw the number of rays specified   *
 *			  by the constant RAYS. Implemented the load_barriers() function *
 *			  which inputs the geometry information for the barriers to      *
 *			  place in the ellipse (at this time, only polygons are          *
 *			  supported). Implemented the draw_barriers() function for       *
 *			  displaying the linked list of barriers in the ellipse (at this *
 *			  time only polygons are supported).                             *
 *                                                                           *
 *    February 10, 1992 - Added the code to compute the normal for each edge *
 *			  of a polygon barrier. Also computed the constant value for the *
 *			  normal's equation.                                             *
 *                                                                           *
 *    February 11, 1992 - Implemented the intersect_barriers() routine for   *
 *			  finding the intersection of a ray with polygonal barriers in   *
 *			  the ellipse.                                                   *
 *                                                                           *
 *    February 12, 1992 - Added routine inside_barrier() to insure that the  *
 *			  random starting point is not inside a barrier. Modified        *
 *			  load_barriers() and draw_barriers() to handle circles          *
 *			  (intersect_barriers() does not do circles at this time).       *
 *                                                                           *
 *    February 15, 1992 - intersect_barriers() now computes intersections of *
 *			  rays with circles and ellipses. Modified load_barriers() and   *
 *			  draw_barriers() to handle ellipses. Modified inside_barrier()  *
 *			  to handle circles and ellipses, and to insure the passed point *
 *			  was not inside any barrier. Removed a bug that caused the      *
 *			  program not to find the intersection of the ray with a         *
 *			  vertical edge of a polygon.                                    *
 *                                                                           *
 *    February 18, 1992 - Modified ellipse barriers so they may be centered  *
 *			  anywhere. Changed the number of rays drawn from being fixed as *
 *			  a constant to being input by the user.                         *
 *                                                                           *
 *    November 7, 2000 - Changed I/O to C++. Changed graphics from user-     *
 *			  developed graphics library to OpenGL.                          *
 *                                                                           *
 *    October 27, 2001 - Allowed the interior barriers to be turned on or    *
 *            off by the user.                                               *
 *                                                                           *
 *    November 17, 2006 - Updated code to work with Visual Studio 2005.      *
 *    November 30, 2008 - Reduced delay time. Ouput running total of number  *
 *            of rays drawn.                                                 *
 *****************************************************************************/
 
#include <math.h>
#include <time.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <GL/glut.h>

#define A 100		/* x-axis 'radius' */
#define B 75		/* y-axis 'radius' */
#define SIZE 500	/* initial window size */
#define DELAY 200   /* # milliseconds to wait between draws */
#define ZERO_TOLERANCE 1.0E-4

struct polygon_data {
   unsigned int n;
   float        *x, *y;
   float	    *normal;
   float	    *d;
};

struct circle_data {
   float xc, yc, radius;
};

struct ellipse_data {
   float xc, yc, a, b;
};

union data_pointer {
   struct polygon_data *polygon_pointer;
   struct circle_data *circle_pointer;
   struct ellipse_data *ellipse_pointer;
};

struct barrier_node {
   int                 barrier_type;
   union data_pointer  barrier_data;
   struct barrier_node *next_barrier;
};
 
int choice, rays;
struct barrier_node *barrier_list = NULL;
bool do_barriers;

void load_barriers ();
void draw_barriers ();
void draw_circle (float xc, float yc, float r);
void intersect_barriers (float t, float s[], float c[], float new_s[], float n[]);
bool inside_barrier (float p[]);
void input ();
void display ();
void sleep ();

using namespace std;

void main (int argc, char** argv)
{
   /* Get input data. */

   input ();

   /* Set graphics window parameters. */

   glutInit (&argc, argv);
   glutInitWindowSize (SIZE, SIZE);
   glutInitWindowPosition (100, 0);
   glutInitDisplayMode (GLUT_SINGLE | GLUT_RGB);
   glutCreateWindow ("Elliptipool");
   glutDisplayFunc (display);
   glutMainLoop ();
}

void display ()
{
   float limit, xold, xnew, yold, ynew, t, twopi, focus, s[2], c[2], asq, bsq;
   float apart, bpart, cpart, new_s[2], n[2], length, dotprod, rmax=RAND_MAX;
   int i;

   glClearColor (1.0, 1.0, 1.0, 1.0);
   glClear (GL_COLOR_BUFFER_BIT);

   asq = (float) (A*A);
   bsq = (float) (B*B);

   /* Determine window so ellipse will fit completely inside. */
   
   if (A > B)
      limit = 1.1 * A;
   else
      limit = 1.1 * B;
   glMatrixMode (GL_PROJECTION);
   glLoadIdentity ();
   gluOrtho2D (-limit, limit, -limit, limit);
   
   /* Draw ellipse, taking advantage of four-fold symmetry. */

   glColor3f (0.0, 0.0, 0.0);
   xold = (float) A;
   yold = 0.0;
   twopi = 2.0 * 3.141592654;
   for (t=0.0; t<=0.25; t+=0.0025)
   {
      xnew = A * cos(twopi*t);
      ynew = B * sin(twopi*t);
	  glBegin (GL_LINES);
	     glVertex2f (xold, yold);
		 glVertex2f (xnew, ynew);
		 glVertex2f (-xold, yold);
		 glVertex2f (-xnew, ynew);
		 glVertex2f (xold, -yold);
		 glVertex2f (xnew, -ynew);
		 glVertex2f (-xold, -yold);
		 glVertex2f (-xnew, -ynew);
	  glEnd ();
      xold = xnew;
      yold = ynew;
   }
   
   /* Draw the two foci as small circles. */
   
   if (A > B)
   {
      focus = sqrt (asq - bsq);
      draw_circle (focus, 0.0, 0.02*B);
      draw_circle (-focus, 0.0, 0.02*B);
   }
   else
   {
      focus = sqrt (bsq - asq);
      draw_circle (0.0, focus, 0.02*A);
      draw_circle (0.0, -focus, 0.02*A);
   }
   glFlush ();
   
   /* Draw the barriers that appear inside the ellipse. */
   
   if (do_barriers) draw_barriers ();
   
   /* Determine starting point randomly for each case. */
   
   switch (choice)
   {
      case 1 : /* At a focus. */
      	       if (rand() % 2)
      		      if (A > B)
				  {
	 	              s[0] = focus;   s[1] = 0.0;
				  }
		          else
				  {
		              s[0] = 0.0;   s[1] = focus;
				  }
	           else
	              if (A > B)
				  {
		              s[0] = -focus;   s[1] = 0.0;
				  }
		          else
				  {
		              s[0] = 0.0;   s[1] = -focus;
				  }
	           break;
      case 2 : /* Inside the foci. */
      	       if (A > B)
      	       {
		           s[1] = 0.0;
				   s[0] = (rand()-rmax) / rmax * 0.75*focus;
				   if (do_barriers)
		              while (inside_barrier (s)) s[0] = (rand()-rmax) / rmax * 0.75*focus;
			   }
	           else
			   {
	               s[0] = 0.0;
				   s[1] = (rand()-rmax) / rmax * 0.75*focus;
		           if (do_barriers)
				      while (inside_barrier (s)) s[1] = (rand()-rmax) / rmax * 0.75*focus;
			   }
               break;
      case 3 : /* Outside the foci. */
      	       focus *= 1.1;
      	       if (A > B)
			   {
		           s[1] = 0.0;
				   s[0] = focus + (A-focus) * rand()/rmax;
		           if (rand() % 2) s[0] = -s[0];
				   if (do_barriers)
					   while (inside_barrier (s))
					   {
		  				   s[0] = focus + (A-focus) * rand()/rmax;
				           if (rand() % 2) s[0] = -s[0];
					   }
			   }
	           else
			   {
	               s[0] = 0.0;
				   s[1] = focus + (B-focus) * rand()/rmax;
		           if (rand() % 2) s[1] = -s[1];
		           if (do_barriers)
					   while (inside_barrier (s))
					   {
						   s[1] = focus + (B-focus) * rand()/rmax;
		                   if (rand() % 2) s[1] = -s[1];	               
					   }
			   }
   }
   
   /* Determine a random starting direction for the ray. */
   
   c[0] = (rand()-rmax) / rmax;
   c[1] = (rand()-rmax) / rmax;
   
   /* Draw the rays as they reflect off the ellipse. */
   
   for (i=1; i<=rays; i++)
   {
	  sleep ();
      
	  /* Determine intersection point of current ray with ellipse. */
      
      apart = bsq*c[0]*c[0] + asq*c[1]*c[1];
      bpart = 2.0 * (bsq*s[0]*c[0] + asq*s[1]*c[1]);
      cpart = bsq*s[0]*s[0] + asq*s[1]*s[1] - asq*bsq;
      t = (-bpart + sqrt(bpart*bpart - 4*apart*cpart)) / (2*apart);
      new_s[0] = s[0] + c[0]*t;
      new_s[1] = s[1] + c[1]*t;
      n[0] = -bsq * new_s[0];
      n[1] = -asq * new_s[1];
      
      /* See if any barriers intersect ray before t. */
      
      if (do_barriers) intersect_barriers (t, s, c, new_s, n);
     
      /* Draw ray from old intersection to new one. */
      
	  glBegin (GL_LINES);
	     glVertex2fv (s);
		 glVertex2fv (new_s);
	  glEnd ();
	  glFlush ();
      
     /* Determine reflected ray's direction. */
      
	  length = sqrt (n[0]*n[0] + n[1]*n[1]);
	  n[0] /= length;
	  n[1] /= length;
	  dotprod = 2 * (c[0]*n[0] + c[1]*n[1]);
	  n[0] *= dotprod;
	  n[1] *= dotprod;
	  c[0] -= n[0];
	  c[1] -= n[1];
      
      /* Change starting point to intersection point. */
      
      s[0] = new_s[0];
	  s[1] = new_s[1];

	  /* Output number of rays drawn to keep user informed, */

	  cout << i << " rays drawn.\r";
   }
   cout << "\nDone." << endl;
}
  
void input ()
{
   char response;

   /* Determine where the user wants to start the rays. */
    
   cout << "Please choose starting location of ray from the following:" << endl << endl;
   cout << "   (1) At a focus" << endl;
   cout << "   (2) Inside the foci" << endl;
   cout << "   (3) Outside the foci" << endl << endl;
   do
   {
      cout << "Please enter your choice (1, 2, or 3) here => ";
      cin >> choice;
   }
   while (choice < 1 || choice > 3);

   /* Determine whether or not to use interior barriers. */

   do
   {
	   cout << endl << "Do you want interior objects? (y/n) ";
	   cin >> response;
   }
   while (response != 'y' && response != 'n');
   do_barriers = response == 'y';
   
   /* Determine how many rays to draw. */
   
   do
   {
      cout << endl << "How many rays do you want drawn? (Must be positive.)  ";
      cin >> rays;
   }
   while (rays <= 0);
   
   /* Load the barriers data. */
   
   if (do_barriers) load_barriers ();
   
   /* See the random number generator. */
   
   srand ((unsigned int) time(NULL));
}

void draw_circle (float xc, float yc, float r)
/* This function draws a circle of radius r centered at (xc, yc). */
{
	float i, limit, step;

	limit = 2 * 3.141592654;
	step = limit / 100;
	limit += step/2;
	glBegin (GL_LINE_LOOP);
	   for (i=0; i<limit; i+=step) glVertex2f (xc+r*cos(i), yc+r*sin(i));
	glEnd ();
}

void draw_barriers ()
/* This function draws the barriers inside the ellipse.  The geometry
   information for the barriers is in a linked list. */
{
   struct barrier_node *current_barrier = barrier_list;
   struct polygon_data *polygon;
   struct circle_data *circle;
   struct ellipse_data *ellipse;
   int i, n;
   float xold, yold, xnew, ynew, twopi, t, cx, cy;
   
   while (current_barrier != NULL)
   {
      switch (current_barrier->barrier_type)
      {
         case 1 : /* polygon */
	 	  polygon = current_barrier->barrier_data.polygon_pointer;
	 	  n = polygon->n;
		  glBegin (GL_LINE_LOOP);
		  for (i = 0; i < n; i++) glVertex2f (polygon->x[i], polygon->y[i]);
	 	  glEnd ();
		  break;
	 case 2 : /* circle */
	 	  circle = current_barrier->barrier_data.circle_pointer;
		  draw_circle (circle->xc, circle->yc, circle->radius);
	 	  break;
	 case 3 : /* ellipse */
	 	  ellipse = current_barrier->barrier_data.ellipse_pointer;
		  cx = ellipse->xc;
		  cy = ellipse->yc;
		  xold = ellipse->a;
		  yold = 0.0;
		  twopi = 2.0 * 3.141592654;
		  glBegin (GL_LINES);
		     for (t=0.0; t<=0.25; t+=0.0025)
			 {
		        xnew = ellipse->a * cos(twopi*t);
		        ynew = ellipse->b * sin(twopi*t);
			    glVertex2f (cx+xold, cy+yold);
			    glVertex2f (cx+xnew, cy+ynew);
		        glVertex2f (cx-xold, cy+yold);
			    glVertex2f (cx-xnew, cy+ynew);
			    glVertex2f (cx+xold, cy-yold);
			    glVertex2f (cx+xnew, cy-ynew);
			    glVertex2f (cx-xold, cy-yold);
			    glVertex2f (cx-xnew, cy-ynew);
			    xold = xnew;
		        yold = ynew;
			 }
		  glEnd ();
	 	  break;
      }
	  glFlush ();
      current_barrier = current_barrier->next_barrier;
   }
}

void load_barriers ()
/* This function loads the geometry information for the barriers to be placed
   inside the ellipse. */
{
   ifstream barrier_file;
   int type;
   unsigned i;
   float point[2], n[2];
   struct barrier_node *new_barrier;
   struct polygon_data *polygon;
   struct circle_data *circle;
   struct ellipse_data *ellipse;
   
   barrier_file.open ("barriers.dat", ios::in);
   if (!barrier_file.is_open()) return;
   while (barrier_file >> type)
   {
      /* Create memory for a new barrier node in the list of barriers and
         attach it to the list. */
      new_barrier = (struct barrier_node *) malloc (sizeof (struct barrier_node));
      new_barrier->next_barrier = barrier_list;
      barrier_list = new_barrier;
      
      /* Load barrier node with appropriate data. */
      
      new_barrier->barrier_type = type;       
      switch (type)
      {
         case 1 : /* polygon */
	 	  polygon = (struct polygon_data *) malloc (sizeof (struct polygon_data));
		  new_barrier->barrier_data.polygon_pointer = polygon;
		  barrier_file >> polygon->n;
		  polygon->x = (float *) calloc (polygon->n, sizeof(float));
		  polygon->y = (float *) calloc (polygon->n, sizeof(float));
		  polygon->normal=(float *)calloc(2*polygon->n,sizeof(float));
		  polygon->d = (float *) calloc (polygon->n, sizeof(float));
		  for (i=0; i<polygon->n; i++)
		     barrier_file >> polygon->x[i] >> polygon->y[i];
		  for (i=0; i<polygon->n-1; i++)
		  {
		     point[0] = polygon->x[i];
		     point[1] = polygon->y[i];
		     n[0] = polygon->normal[2*i] = -(polygon->y[i+1] - polygon->y[i]);
		     n[1] = polygon->normal[2*i+1] = polygon->x[i+1] - polygon->x[i];
		     polygon->d[i] = n[0]*point[0] + n[1]*point[1];
		  }
		  i = polygon->n - 1;
		  point[0] = polygon->x[i];
		  point[1] = polygon->y[i];
		  n[0]=polygon->normal[2*i]=-(polygon->y[0] - polygon->y[i]);
		  n[1]=polygon->normal[2*i+1]=polygon->x[0] - polygon->x[i];
		  polygon->d[i] = n[0]*point[0] + n[1]*point[1];
		  break;
	 case 2 : /* circle */
	 	  circle = (struct circle_data *) malloc (sizeof (struct circle_data));
		  new_barrier->barrier_data.circle_pointer = circle;
		  barrier_file >> circle->xc >> circle->yc >> circle->radius;
	 	  break;
	 case 3 : /* ellipse */
	 	  ellipse = (struct ellipse_data *) malloc (sizeof (struct ellipse_data));
		  new_barrier->barrier_data.ellipse_pointer = ellipse;
		  barrier_file >> ellipse->xc >> ellipse->yc >> ellipse->a >> ellipse->b;
	 	  break;
      }
   } 
}

void intersect_barriers (float t, float s[], float c[], float new_s[],
   float n[])
/* This function determines if the ray under consideration (s+ct) will hit any
 * barrier.  If it does, the intersection point (new_s) and normal (n) are
 * returned. */
{
   struct barrier_node *current_barrier = barrier_list;
   struct polygon_data *polygon;
   struct circle_data *circle;
   struct ellipse_data *ellipse;
   float ti, thit, nc, norm[2], p2x, p2y, h[2], sh[2], shc, discr;
   float asq, bsq, apart, bpart, cpart, xc, yc;
   unsigned i;
   
   while (current_barrier != NULL)
   {
      switch (current_barrier->barrier_type)
      {
         case 1 : /* polygon */
	 	  polygon = current_barrier->barrier_data.polygon_pointer;
		  for (i=0; i<polygon->n; i++)
		  {
		     norm[0] = polygon->normal[2*i];
		     norm[1] = polygon->normal[2*i+1];
		     nc = norm[0]*c[0] + norm[1]*c[1];
		     if (nc != 0.0)
		     {
		     	/* Determine where on ray intersection is. */
		        ti = (polygon->d[i] - (norm[0]*s[0] + norm[1]*s[1]))/nc;
			    if ((ti > ZERO_TOLERANCE) && (ti < t))
				{
		           /* See if intersection is on polygon edge. */

			       if (i != polygon->n-1)
				   {
			          p2x=polygon->x[i+1];   p2y=polygon->y[i+1];
				   }
			       else
				   {
			          p2x = polygon->x[0];   p2y=polygon->y[0];
				   }
			       if (p2x != polygon->x[i])
			          thit = (s[0]+c[0]*ti-polygon->x[i]) / (p2x-polygon->x[i]);
			       else
			          thit = (s[1]+c[1]*ti-polygon->y[i]) / (p2y-polygon->y[i]);
			       if ((thit > 0.0) && (thit < 1.0))
				   {
			          /* Intersection on edge. */
			   
			          t = ti;
			          new_s[0] = s[0] + c[0]*t;
			          new_s[1] = s[1] + c[1]*t;
			          n[0] = norm[0];
			          n[1] = norm[1];
				   }
				}
		     }
		  }
	 	  break;
	 case 2 : /* circle */
	 	  circle = current_barrier->barrier_data.circle_pointer;
	 	  h[0] = circle->xc;
		  h[1] = circle->yc;
		  sh[0] = s[0] - h[0];
		  sh[1] = s[1] - h[1];
		  shc = sh[0]*c[0] + sh[1]*c[1];
		  discr = (shc*shc - (c[0]*c[0] + c[1]*c[1]) *
		     ((sh[0]*sh[0] + sh[1]*sh[1])-circle->radius*circle->radius));
		  if (discr > ZERO_TOLERANCE) /* ray intersects circle */
		  {
		     ti = (-shc-sqrt(discr)) / (c[0]*c[0] + c[1]*c[1]);
		     if ((ti > ZERO_TOLERANCE) && (ti < t))
		     {
		        t = ti;
			    new_s[0] = s[0] + c[0]*t;
			    new_s[1] = s[1] + c[1]*t;
				n[0] = new_s[0] - h[0];
				n[1] = new_s[1] - h[1];
		     }
		  }
	 	  break;
	 case 3 : /* ellipse */
	 	  ellipse = current_barrier->barrier_data.ellipse_pointer;
		  xc = ellipse->xc;
		  yc = ellipse->yc;
		  asq = ellipse->a * ellipse->a;
		  bsq = ellipse->b * ellipse-> b;
		  apart = bsq*c[0]*c[0] + asq*c[1]*c[1];
		  bpart = 2.0 * (bsq*c[0]*(s[0]-xc) + asq*c[1]*(s[1]-yc));
		  cpart = bsq*(s[0]-xc)*(s[0]-xc) + asq*(s[1]-yc)*(s[1]-yc) - asq*bsq;
		  ti=(-bpart - sqrt(bpart*bpart - 4*apart*cpart)) / (2*apart);
		  if ((ti > ZERO_TOLERANCE) && (ti < t))
		  {
		     t = ti;
		     new_s[0] = s[0] + c[0]*t;
		     new_s[1] = s[1] + c[1]*t;
		     n[0] = bsq * (new_s[0]-xc);
		     n[1] = asq * (new_s[1]-yc);
		  }
	 	  break;
      }
      current_barrier = current_barrier->next_barrier;
   }
}

bool inside_barrier (float p[])
/* This function determines if a point is inside a barrier. It returns true 
 * if it is and false if it's not. */
{
   struct barrier_node *current_barrier = barrier_list;
   struct polygon_data *polygon;
   struct circle_data *circle;
   struct ellipse_data *ellipse;
   float n[2], x, y, r;
   unsigned i;
   bool inside_polygon;
   
   if (barrier_list == NULL) return false;
   while (current_barrier != NULL)
   {
      switch (current_barrier->barrier_type)
      {
         case 1 : /* polygon */
	 	  polygon = current_barrier->barrier_data.polygon_pointer;
		  inside_polygon = true;
		  for (i=0; i<polygon->n; i++)
		  {
		     n[0] = polygon->normal[2*i];
		     n[1] = polygon->normal[2*i+1];
		     if (n[0]*p[0] + n[1]*p[1] > polygon->d[i]) inside_polygon = false;
		  }
		  if (inside_polygon) return true;
		  break;
	 case 2 : /* circle */
	 	  circle = current_barrier->barrier_data.circle_pointer;
		  x = p[0] - circle->xc;
		  y = p[1] - circle->yc;
		  r = circle->radius;
		  if (x*x + y*y <= r*r ) return true;
	 	  break;
	 case 3 : /* ellipse */
	 	  ellipse = current_barrier->barrier_data.ellipse_pointer;
		  x = (p[0]-ellipse->xc) / ellipse->a;
		  y = (p[1]-ellipse->yc) / ellipse->b;
		  if (x*x + y*y <= 1.0) return true;
	 	  break;
      }
      current_barrier = current_barrier->next_barrier;
   }
   return false;
}

void sleep()
/* This function delays the program's execution by the number of milliseconds specified
   by the global constant DELAY. */
{
   clock_t goal;
   goal = DELAY + clock();
   while (goal > clock());
}

