import type { LandingInteractions } from '../hooks';

type Props = Pick<LandingInteractions, 'content' | 'selectedType' | 'currentProducts' | 'quantities' | 'cufeCode' | 'orderTransmittedMsg' | 'handleTypeChange' | 'handleQuantity' | 'rawSubtotal' | 'fefoSavings' | 'tax' | 'totalPayable' | 'handleEmitOrder'>;

export function LandingSimulator({ content, selectedType, currentProducts, quantities, cufeCode, orderTransmittedMsg, handleTypeChange, handleQuantity, rawSubtotal, fefoSavings, tax, totalPayable, handleEmitOrder }: Props) {
  const { simulator } = content;
  const receipt = simulator.receipt;

  return (
    <>
      {/* Live Interactive Simulator */}
      <section id="simulador">
        <div className="sec-head">
          <h2>{simulator.title}</h2>
          <p className="sub">{simulator.subtitle}</p>
        </div>

        <div className="simulator-box">
          {/* Left: Order Builder Controls */}
          <div className="sim-controls">
            <h3>{simulator.typeLabel}</h3>
            <div className="type-buttons">
              {(simulator.types || []).map(t => (
                <button
                  key={t.key}
                  className={`type-btn ${selectedType === t.key ? 'active' : ''}`}
                  onClick={() => handleTypeChange(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <h3>{simulator.ingredientsLabel}</h3>
            <div className="sim-items">
              {currentProducts.map(prod => (
                <div key={prod.id} className="sim-item">
                  <div className="sim-item-info">
                    <span className="sim-item-name">{prod.name}</span>
                    <span className="sim-item-meta">
                      ${prod.price.toLocaleString('es-CO')} COP / {prod.unit} •{' '}
                      <span className="sim-item-fefo">
                        Lote FEFO (-{Math.round((prod.fefoDiscount || 0) * 100)}%)
                      </span>
                    </span>
                  </div>
                  <div className="sim-qty-control">
                    <button className="qty-btn" onClick={() => handleQuantity(prod.id, -1)} aria-label={receipt.decreaseLabel}>-</button>
                    <span className="qty-val">{quantities[prod.id] || 0}</span>
                    <button className="qty-btn" onClick={() => handleQuantity(prod.id, 1)} aria-label={receipt.increaseLabel}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Simulated DIAN Electronic Receipt */}
          <div className="sim-receipt">
            <div className="receipt-header">
              <div className="receipt-title">
                <span>{receipt.title}</span>
                <span className="dian-stamp">{receipt.stamp}</span>
              </div>
              <div className="receipt-meta">
                <div>{receipt.issuer}</div>
                <div>{receipt.buyer}</div>
                <div>{receipt.date}</div>
              </div>
            </div>

            <div className="receipt-breakdown">
              <div className="receipt-row">
                <span>{receipt.subtotal}</span>
                <span>${Math.round(rawSubtotal).toLocaleString('es-CO')} COP</span>
              </div>
              <div className="receipt-row discount">
                <span>{receipt.savings}</span>
                <span>-${Math.round(fefoSavings).toLocaleString('es-CO')} COP</span>
              </div>
              <div className="receipt-row">
                <span>{receipt.taxes}</span>
                <span>${tax.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="receipt-total">
                <span>{receipt.total}</span>
                <b>${Math.round(totalPayable).toLocaleString('es-CO')} COP</b>
              </div>
            </div>

            <div className="cufe-box">
              <b>{receipt.cufeLabel}</b>
              <span>{cufeCode}</span>
            </div>

            <button
              className="btn"
              style={{
                width: '100%',
                background: orderTransmittedMsg ? '#10b981' : undefined,
              }}
              onClick={handleEmitOrder}
            >
              <span>
                {orderTransmittedMsg ? receipt.success : receipt.submit}
              </span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
