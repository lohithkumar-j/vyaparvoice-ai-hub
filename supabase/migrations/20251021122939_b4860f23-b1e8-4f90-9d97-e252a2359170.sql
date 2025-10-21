-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  customer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_transaction TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  top_products JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for now - can be restricted later with auth)
CREATE POLICY "Allow public read access on inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on inventory" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on inventory" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on inventory" ON public.inventory FOR DELETE USING (true);

CREATE POLICY "Allow public read access on sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on sales" ON public.sales FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on customers" ON public.customers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on analytics" ON public.analytics FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on analytics" ON public.analytics FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.inventory (name, quantity, price, reorder_level, category) VALUES
('Rice - 25kg', 45, 1200.00, 20, 'Grains'),
('Wheat Flour - 10kg', 30, 450.00, 15, 'Grains'),
('Sugar - 1kg', 80, 45.00, 30, 'Groceries'),
('Tea Powder - 500g', 25, 180.00, 10, 'Beverages'),
('Cooking Oil - 1L', 15, 150.00, 10, 'Cooking'),
('Pulses - Dal - 1kg', 50, 120.00, 20, 'Grains');

INSERT INTO public.customers (name, phone, balance, last_transaction) VALUES
('Rajesh Kumar', '+91-9876543210', 2500.00, now() - interval '2 days'),
('Priya Sharma', '+91-9876543211', -500.00, now() - interval '5 days'),
('Amit Patel', '+91-9876543212', 1200.00, now() - interval '1 day'),
('Sneha Reddy', '+91-9876543213', 0.00, now() - interval '10 days');

INSERT INTO public.analytics (date, revenue, profit, top_products) VALUES
(CURRENT_DATE - interval '6 days', 15000.00, 3000.00, '["Rice - 25kg", "Sugar - 1kg"]'::jsonb),
(CURRENT_DATE - interval '5 days', 18000.00, 3600.00, '["Wheat Flour - 10kg", "Tea Powder - 500g"]'::jsonb),
(CURRENT_DATE - interval '4 days', 22000.00, 4400.00, '["Rice - 25kg", "Cooking Oil - 1L"]'::jsonb),
(CURRENT_DATE - interval '3 days', 19000.00, 3800.00, '["Sugar - 1kg", "Pulses - Dal - 1kg"]'::jsonb),
(CURRENT_DATE - interval '2 days', 25000.00, 5000.00, '["Rice - 25kg", "Wheat Flour - 10kg"]'::jsonb),
(CURRENT_DATE - interval '1 day', 21000.00, 4200.00, '["Tea Powder - 500g", "Sugar - 1kg"]'::jsonb),
(CURRENT_DATE, 28000.00, 5600.00, '["Rice - 25kg", "Cooking Oil - 1L"]'::jsonb);