import React from 'react'
import { Shield, Mail, Phone } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.mainContent}>
                    <div style={styles.brand}>
                        <div style={styles.logo}>
                            <Shield size={24} />
                            <span style={styles.brandName}>International Payments</span>
                        </div>
                        <p style={styles.tagline}>
                            Secure and reliable international payment solutions for businesses and individuals.
                        </p>
                    </div>

                    <div style={styles.links}>
                        <div style={styles.linkGroup}>
                            <h4 style={styles.linkTitle}>Services</h4>
                            <a href="#" style={styles.link}>SWIFT Payments</a>
                            <a href="#" style={styles.link}>International Transfers</a>
                            <a href="#" style={styles.link}>Currency Exchange</a>
                        </div>

                        <div style={styles.linkGroup}>
                            <h4 style={styles.linkTitle}>Support</h4>
                            <a href="#" style={styles.link}>Help Center</a>
                            <a href="#" style={styles.link}>Contact Us</a>
                            <a href="#" style={styles.link}>Security Tips</a>
                        </div>

                        <div style={styles.linkGroup}>
                            <h4 style={styles.linkTitle}>Legal</h4>
                            <a href="#" style={styles.link}>Privacy Policy</a>
                            <a href="#" style={styles.link}>Terms of Service</a>
                            <a href="#" style={styles.link}>Compliance</a>
                        </div>
                    </div>

                    <div style={styles.contact}>
                        <h4 style={styles.contactTitle}>Contact Info</h4>
                        <div style={styles.contactItem}>
                            <Mail size={16} />
                            <span>support@internationalpayments.com</span>
                        </div>
                        <div style={styles.contactItem}>
                            <Phone size={16} />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div style={styles.contactHours}>
                            <span>24/7 Customer Support</span>
                        </div>
                    </div>
                </div>

                <div style={styles.bottomBar}>
                    <div style={styles.copyright}>
                        © {currentYear} International Payments Portal. All rights reserved.
                    </div>
                    <div style={styles.securityBadge}>
                        <Shield size={16} />
                        <span>Bank-Grade Security</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

const styles = {
    footer: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        marginTop: 'auto'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 20px 24px'
    },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: '48px',
        marginBottom: '32px'
    },
    brand: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '20px',
        fontWeight: 'bold'
    },
    brandName: {
        fontSize: '20px',
        fontWeight: 'bold'
    },
    tagline: {
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: '1.6',
        maxWidth: '400px'
    },
    links: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '32px'
    },
    linkGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    linkTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '8px'
    },
    link: {
        color: 'rgba(255, 255, 255, 0.8)',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.3s'
    },
    contact: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    contactTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '8px'
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)'
    },
    contactHours: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: '8px'
    },
    bottomBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
    },
    copyright: {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)'
    },
    securityBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)'
    }
}

export default Footer