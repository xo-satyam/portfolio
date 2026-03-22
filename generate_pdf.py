#!/usr/bin/env python3
"""
Script to generate Resume.pdf from Resume.txt using FPDF
"""

from fpdf import FPDF
from pathlib import Path

def generate_pdf():
    """
    Generate Resume.pdf from Resume.txt
    """
    try:
        # Get the current directory
        current_dir = Path(__file__).parent
        
        # Define file paths
        txt_file = current_dir / 'Resume.txt'
        pdf_file = current_dir / 'Resume.pdf'
        
        # Check if text file exists
        if not txt_file.exists():
            print(f"Error: {txt_file} not found")
            return False
        
        print(f"Generating PDF from {txt_file.name}...")
        
        # Read the resume text
        with open(txt_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace special characters that aren't supported
        content = content.replace('•', '-')
        content = content.replace('★', '*')
        content = content.replace('✓', 'x')
        content = content.replace('📧', 'Email:')
        content = content.replace('📱', 'Phone:')
        content = content.replace('📍', 'Location:')
        
        # Create PDF with Arial font (standard)
        pdf = FPDF()
        pdf.add_page(format='A4')
        pdf.set_font("Arial", size=9)
        
        # Set margins for better appearance
        pdf.set_left_margin(12)
        pdf.set_right_margin(12)
        pdf.set_top_margin(12)
        
        # Add content line by line
        for line in content.split('\n'):
            # Handle empty lines
            if not line.strip():
                pdf.ln(2)
            else:
                pdf.multi_cell(0, 5, line, new_x="LMARGIN", new_y="NEXT")
        
        # Save PDF
        pdf.output(str(pdf_file))
        
        print(f"✅ Success! PDF saved at: {pdf_file}")
        print(f"   File size: {pdf_file.stat().st_size / 1024:.2f} KB")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    generate_pdf()
