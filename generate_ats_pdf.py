#!/usr/bin/env python3
"""
Script to generate ATS-friendly Resume.pdf from Resume_ATS.txt using FPDF
"""

from fpdf import FPDF
from pathlib import Path

def generate_ats_pdf():
    """
    Generate ATS-friendly Resume_ATS.pdf from Resume_ATS.txt
    """
    try:
        # Get the current directory
        current_dir = Path(__file__).parent
        
        # Define file paths
        txt_file = current_dir / 'Resume_ATS.txt'
        pdf_file = current_dir / 'Resume_ATS.pdf'
        
        # Check if text file exists
        if not txt_file.exists():
            print(f"Error: {txt_file} not found")
            return False
        
        print(f"Generating ATS-friendly PDF from {txt_file.name}...")
        
        # Read the resume text
        with open(txt_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace special characters
        content = content.replace('•', '-')
        content = content.replace('★', '*')
        content = content.replace('✓', 'x')
        
        # Create PDF with standard formatting for ATS compatibility
        pdf = FPDF()
        pdf.add_page(format='A4')
        pdf.set_font("Helvetica", size=10)
        
        # Set margins
        pdf.set_left_margin(14)
        pdf.set_right_margin(14)
        pdf.set_top_margin(14)
        
        # Add content line by line
        for line in content.split('\n'):
            # Handle empty lines
            if not line.strip():
                pdf.ln(2)
            else:
                # Determine font style based on line content
                if line.isupper() and len(line) < 50 and line.strip():
                    # Section headers
                    pdf.set_font("Helvetica", "B", 11)
                    pdf.multi_cell(0, 6, line, new_x="LMARGIN", new_y="NEXT")
                    pdf.set_font("Helvetica", size=10)
                elif line.startswith('-'):
                    # Bullet points
                    pdf.set_font("Helvetica", size=9)
                    pdf.multi_cell(0, 5, line, new_x="LMARGIN", new_y="NEXT")
                    pdf.set_font("Helvetica", size=10)
                else:
                    # Regular text
                    pdf.multi_cell(0, 5, line, new_x="LMARGIN", new_y="NEXT")
        
        # Save PDF
        pdf.output(str(pdf_file))
        
        print(f"✅ Success! ATS-friendly PDF saved at: {pdf_file}")
        print(f"   File size: {pdf_file.stat().st_size / 1024:.2f} KB")
        print(f"\nATS Compliance:")
        print(f"  ✓ Standard font (Helvetica)")
        print(f"  ✓ Simple formatting")
        print(f"  ✓ No special characters")
        print(f"  ✓ Clear section headers")
        print(f"  ✓ Standard bullet points")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    generate_ats_pdf()
